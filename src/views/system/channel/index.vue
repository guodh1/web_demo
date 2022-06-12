<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入渠道名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道产品码" prop="channelProductCode">
        <el-input
          v-model="queryParams.channelProductCode"
          placeholder="请输入渠道产品码"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增渠道</el-button>

        <el-button
          type="primary"
          plain
          icon="el-icon-edit"
          size="mini"
          @click="handleAddOrUpdateParams"
        >参数配置</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index"  align="center" width="120" />
      <el-table-column label="渠道名称" prop="name" :show-overflow-tooltip="true"  align="center" width="150" />
      <el-table-column label="渠道产品码" prop="channelProductCode" :show-overflow-tooltip="true"  align="center" width="150" />
      <el-table-column label="渠道支付码" prop="payProductCode" :show-overflow-tooltip="true"  align="center" width="150" />
      <el-table-column label="创建时间" prop="createTime"  align="center" width="180" />
      <el-table-column label="更新时间" prop="updateTime"  align="center" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="渠道名称" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入渠道名称" />
        </el-form-item>

        <el-form-item prop="channelProductCode" label="渠道产品码">
          <el-input v-model="form.channelProductCode" placeholder="请输入渠道产品码" />
        </el-form-item>

        <el-form-item prop="payProductCode" label="支付产品码">
          <el-input v-model="form.payProductCode" placeholder="请输入渠道产品码" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="openConfigParams" width="45%" append-to-body>
      <el-form ref="formParams" :model="formParams" :rules="formParamsRules" label-width="100px">

        <el-form-item prop="type" label="参数类型" required>
          <el-select v-model="formParams.type" placeholder="环境类型" clearable @change="getParamsDetail">
            <el-option
              v-for="dict in dict.type.sys_params"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="method" label="请求方式">
          <el-select v-model="formParams.method" placeholder="请求方式" clearable>
            <el-option
              v-for="method in methodOptions"
              :key="method.value"
              :label="method.value"
              :value="method.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="path" label="请求路径">
          <el-input v-model="formParams.path" placeholder="请输入path" style="width: 220px" />
        </el-form-item>

        <el-form-item label="参数配置" prop="params">
          <editor
            v-contextmenu:contextmenu
            style='font-size: 15px'
            v-model='formParams.params'
            @init='editorInit'
            lang='json'
            theme='chrome'
            width='90%'
            height='400px'
            :options='{}'
          >
          </editor>
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormParams">更新参数</el-button>
        <el-button @click="openConfigParams=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getChannel,
    delChannel,
    addChannel,
    updateChannel,
    listChannel
  } from "@/api/system/channel";
  import {getParams, updateParams} from "../../../api/system/channel";
  import {formatJsonData} from "../../../utils";

  export default {
    name: "Channel",
    dicts: ['sys_params'],
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 角色表格数据
        channelList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 是否显示参数配置弹出层
        openConfigParams: false,
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          order: 'create_time',
          name: undefined
        },
        // 表单参数
        form: {},
        formParams: {
          type: "1",
          params: undefined
        },
        methodOptions: [
          {"value": "GET"},
          {"value": "POST"},
          {"value": "PUT"},
          {"value": "DELETE"},
          {"value": "PATCH"}
        ],
        // 表单校验
        rules: {
          name: [
            { required: true, message: "渠道名称不能为空", trigger: "blur" }
          ],
          channelProductCode: [
            { required: true, message: "渠道产品码不能为空", trigger: "blur" }
          ],
          payProductCode: [
            { required: true, message: "支付产品码不能为空", trigger: "blur" }
          ]
        },
        formParamsRules: {
          method: [
            { required: true, message: "请求方法不能为空", trigger: "blur" }
          ],
          path: [
            { required: true, message: "请求路径不能为空", trigger: "blur" }
          ],
          type: [
            { required: true, message: "参数类型不能为空", trigger: "blur" }
          ],
          params: [
            { required: true, message: "参数配置不能为空", trigger: "blur" }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    components: {
      editor: require('vue2-ace-editor')
    },
    methods: {
      editorInit() {
        require('brace/ext/language_tools')
        require('brace/mode/json')
        require('brace/theme/chrome')
        require('brace/snippets/json')
      },
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        listChannel(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.channelList = response.result.list;
            this.total = response.result.total;
            this.loading = false;
          }
        );
      },
      /** 获取参数详情*/
      getParamsDetail() {
        getParams(this.formParams.type).then(response => {
          if (response.result === null){
            this.$set(this.formParams, 'params', null)
          }else {
            this.$set(this.formParams, 'params', formatJsonData(response.result.params))
          }
          }
        );
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        if (this.$refs.menu !== undefined) {
          this.$refs.menu.setCheckedKeys([]);
        }
        this.form = {
          id: undefined,
          name: undefined,
          channelProductCode: undefined,
          payProductCode: undefined,
          status: "0",
          menuIds: [],
          deptIds: []
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = [];
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length!=1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加渠道";
      },
      /** 新增按钮操作 */
      handleAddOrUpdateParams() {
        this.openConfigParams = true;
        this.title = "参数配置";
        this.getParamsDetail()
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getChannel(id).then(response => {
          this.form = response.result;
          this.open = true;
          this.title = "修改渠道";
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id !== undefined) {
              updateChannel(this.form).then(response => {
                if (response.success){
                  this.$modal.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }else {
                  this.$modal.msgError(response.message)
                  this.getList();
                }
              });
            } else {
              addChannel(this.form).then(response => {
                if (response.success){
                  this.$modal.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                }else {
                  this.$modal.msgError(response.message)
                  this.getList();
                }
              });
            }
          }
        });
      },
      submitFormParams(){
        this.$refs["formParams"].validate(valid => {
          if (valid) {
            updateParams(this.formParams).then(response => {
              if (response.success){
                this.$modal.msgSuccess(response.message);
                this.openConfigParams = false;
              }else {
                this.$modal.msgError(response.message)
              }
            });
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids =  row.id || this.ids;
        this.$modal.confirm('是否确认删除渠道编号为"' + row.name + '"的数据项？').then(function() {
          return delChannel(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
    }
  };
</script>
