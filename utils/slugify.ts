export function slugify(text: string): string {
  if (!text) return ''
  return text
    .toString()
    .normalize('NFD') // divide caracteres acentuados en sus letras base y diacríticos
    .replace(/[\u0300-\u036f]/g, '') // remueve los diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remueve caracteres inválidos
    .replace(/\s+/g, '-') // reemplaza espacios con guiones
    .replace(/-+/g, '-') // remueve guiones consecutivos
}
