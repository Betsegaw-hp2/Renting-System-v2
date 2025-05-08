// Convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
	return obj
  }

  if (Array.isArray(obj)) {
	return obj.map(toCamelCase)
  }

  const camelCaseObj: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
	const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
	camelCaseObj[camelKey] = toCamelCase(obj[key])
  })

  return camelCaseObj
}

export default toCamelCase