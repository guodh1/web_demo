import request from '@/utils/request'

// 查询环境列表
export function listConfig(query) {
  return request({
    url: '/config',
    method: 'get',
    params: query
  })
}

// 查询环境详细
export function getConfig(id) {
  return request({
    url: '/config/' + id,
    method: 'get'
  })
}

// 新增环境
export function addConfig(data) {
  return request({
    url: '/config',
    method: 'post',
    data: data
  })
}

// 修改环境
export function updateConfig(data) {
  return request({
    url: '/config/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除环境
export function delConfig(id) {
  return request({
    url: '/config/' + id,
    method: 'delete'
  })
}
