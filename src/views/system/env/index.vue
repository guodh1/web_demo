<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="envList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index"  align="center" width="120" />
      <el-table-column label="环境名称" prop="name" :show-overflow-tooltip="true"  align="center" width="150" />
      <el-table-column label="环境地址" prop="url" :show-overflow-tooltip="true"  align="center" width="150" />
      <el-table-column label="环境类型" prop="type" :show-overflow-tooltip="true"  align="center" width="150" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_envs" :value="scope.row.type"/>
        </template>
      </el-table-column>
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
        <el-form-item label="环境名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入环境名称" />
        </el-form-item>

        <el-form-item prop="url" label="环境地址">
          <el-input v-model="form.url" placeholder="请输入环境地址：例如http://testpaycenter.zhiyoubao.com/" />
        </el-form-item>

        <el-form-item prop="type" label="环境类型" required>
          <el-select v-model="form.type" placeholder="环境类型" clearable>
            <el-option
              v-for="dict in dict.type.sys_envs"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import {
    getEnv,
    delEnv,
    addEnv,
    updateEnv,
    listEnv
  } from "@/api/system/env";

  export default {
    name: "Env",
    dicts: ['sys_envs'],
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
        envList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          order: '-id',
          name: undefined
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          name: [
            { required: true, message: "环境名称不能为空", trigger: "blur" }
          ],
          url: [
            { required: true, message: "环境地址不能为空", trigger: "blur" }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询角色列表 */
      getList() {
        this.loading = true;
        listEnv(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
            this.envList = response.result.list;
            this.total = response.result.total;
            this.loading = false;
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
          url: undefined,
          type: undefined,
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
        this.title = "添加环境";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getEnv(id).then(response => {
          this.form = response.result;
          this.open = true;
          this.title = "修改环境";
        });
      },
      /** 提交按钮 */
      submitForm: function() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id !== undefined) {
              updateEnv(this.form).then(response => {
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
              addEnv(this.form).then(response => {
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
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids =  row.id || this.ids;
        this.$modal.confirm('是否确认删除环境编号为"' + row.name + '"的数据项？').then(function() {
          return delEnv(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
    }
  };
</script>
