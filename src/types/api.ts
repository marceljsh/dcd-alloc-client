export interface ApiResponse<T> {
  success : boolean
  message : string
  data    : T | null
}

export interface Paging<T> {
  items : T[]
  meta  : PagingMeta
}

interface PagingMeta {
  page       : number
  size       : number
  totalPages : number
  totalItems : number
}
