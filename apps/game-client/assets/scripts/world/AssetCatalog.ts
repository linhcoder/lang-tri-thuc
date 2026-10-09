export const villageAssetNames=['child','boy-blue','girl-pink','girl-yellow','boy-red-hair','boy-blue-hair','girl-pink-hair','girl-yellow-hair','temple','house','banyan','banana','rice','farmer','tiles','elder','co-tam','teacher','market-lady','potter','ti-na','hang-cuoi','lotus','village-details'] as const;
export interface AssetMetadata {title:string;source:string;license:string}
export function assetCatalog(){return villageAssetNames.map(id=>({id,path:`village/${id}.png`,title:id,source:'Built-in imagegen; see ART.md',license:'Generated asset; provenance review pending'}));}
