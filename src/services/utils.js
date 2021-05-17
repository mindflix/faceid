export async function getCollection(db,collection){
  const qs = await db.collection(collection).get();
  return mapData(qs)
}

export function mapData(qs){
  return qs.docs.map(doc => Object.assign(doc.data(),{id:doc.id}))
}

export function mapId(qs){
  return qs.docs.map(doc => doc.id)
}