// Tag-related types

export interface Tag {
  id: string
  name: string
}

export interface UserTag {
  id: string
  name: string
}

export interface CreateUserTagsPayload {
  tags: string[]
}
