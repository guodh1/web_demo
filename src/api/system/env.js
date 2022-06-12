import request from '@/utils/request'

// 查询环境列表
export function listEnv(query) {
  return request({
    url: '/envs',
    method: 'get',
    params: query
  })
}

// 查询环境详细
export function getEnv(id) {
  return request({
    url: '/envs/' + id,
    method: 'get'
  })
}

// 新增环境
export function addEnv(data) {
  return request({
    url: '/envs',
    method: 'post',
    data: data
  })
}

// 修改环境
export function updateEnv(data) {
  return request({
    url: '/envs/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除环境
export function delEnv(id) {
  return request({
    url: '/envs/' + id,
    method: 'delete'
  })
}
