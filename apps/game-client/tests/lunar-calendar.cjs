// Civil/lunar fixtures are date facts decoded from Ho Ngoc Duc's reference table.
// Source: https://xemamlich.uhm.vn/JavaScript/ (read 2026-10-11).
// Reference library/code is not included in the project or runtime.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;vm.runInThisContext(`(function(require,module,exports){${code}\n})`,{filename:file})(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name),module,module.exports);return module.exports;}
const lunar=load(path.join(__dirname,'../assets/scripts/world/VietnamLunarCalendar.ts'));
const festivals=load(path.join(__dirname,'../assets/scripts/world/FestivalCalendar.ts'));
for(const fixture of require('./lunar-reference-fixtures.json')){
 assert.deepEqual(lunar.lunarToSolar(fixture.lunar),fixture.solar);
 assert.deepEqual(lunar.solarToLunar(fixture.solar),fixture.lunar);
}
// Leap month and a Vietnam/China date difference catch errors hidden by round trips.
assert.deepEqual(lunar.solarToLunar({year:2023,month:3,day:22}),{year:2023,month:2,day:1,leap:true});
assert.deepEqual(lunar.solarToLunar({year:2033,month:12,day:22}),{year:2033,month:11,day:1,leap:true});
assert.deepEqual(lunar.solarToLunar({year:1974,month:12,day:13}),{year:1974,month:11,day:1,leap:false});
assert.equal(festivals.festivalDatesForYear(2030).tet,'2030-02-02');
let days=0;
for(let epoch=Date.UTC(1900,0,1);epoch<Date.UTC(2200,0,1);epoch+=86400000){
 const d=new Date(epoch),civil={year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()},converted=lunar.solarToLunar(civil);
 assert.ok(converted&&converted.day>=1&&converted.day<=30);assert.deepEqual(lunar.lunarToSolar(converted),civil);days++;
}
for(const civil of [{year:1899,month:12,day:31},{year:2200,month:1,day:1},{year:2026,month:2,day:29},{year:2026,month:13,day:1},{year:NaN,month:1,day:1}])assert.equal(lunar.solarToLunar(civil),null);
for(const date of [{year:2026,month:1,day:31,leap:false},{year:2026,month:2,day:1,leap:true},{year:2026,month:1,day:1,leap:'false'}])assert.equal(lunar.lunarToSolar(date),null);
for(const [year,expected] of Object.entries(festivals.festivalDates))assert.deepEqual(festivals.festivalDatesForYear(Number(year)),expected);
assert.equal(festivals.festivalOccurrence('tet',new Date('2030-02-01T16:59:59Z')).active,false);
assert.equal(festivals.festivalOccurrence('tet',new Date('2030-02-01T17:00:00Z')).active,true);
assert.equal(festivals.festivalOccurrence('tet',new Date('2199-02-01T00:00:00Z')),null);
assert.equal(festivals.festivalDatesForYear(2200),null);assert.equal(festivals.festivalDatesForYear(2026.5),null);
console.log(`PASS lunar calendar: 30 independent festival fixtures, leap months, UTC+7 rollover and ${days} civil-day round trips (1900–2199)`);
