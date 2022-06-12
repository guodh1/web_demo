import request from '@/utils/request'

// 查询渠道列表
export function listChannel(query) {
  return request({
    url: '/channel',
    method: 'get',
    params: query
  })
}

// 查询渠道详细
export function getChannel(id) {
  return request({
    url: '/channel/' + id,
    method: 'get'
  })
}

// 查询参数详情
export function getParams(type) {
  return request({
    url: '/params/' + type,
    method: 'get'
  })
}

// 新增渠道
export function addChannel(data) {
  return request({
    url: '/channel',
    method: 'post',
    data: data
  })
}

// 修改渠道
export function updateChannel(data) {
  return request({
    url: '/channel/' + data.id,
    method: 'put',
    data: data
  })
}

// 修改参数
export function updateParams(data) {
  return request({
    url: '/params/' + data.type,
    method: 'post',
    data: data
  })
}

// 删除渠道
export function delChannel(id) {
  return request({
    url: '/channel/' + id,
    method: 'delete'
  })
}
