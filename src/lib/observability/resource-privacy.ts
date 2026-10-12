export function isResourceLocation(value:unknown):boolean {
 if(typeof value!=="string")return false;
 return /(^|\/)(?:portal\/)?recursos(?:\/|\?|$)/.test(value) || value.includes("/api/internal/recursos/");
}
export function containsResourceLocation(event:{request?:{url?:string;headers?:Record<string,string>};transaction?:string}):boolean {
 return isResourceLocation(event.request?.url) || isResourceLocation(event.transaction) || Object.entries(event.request?.headers??{}).some(([name,value])=>name.toLowerCase()==="referer" && isResourceLocation(value));
}
