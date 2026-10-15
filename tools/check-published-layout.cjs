const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');

// Accept the public /content/layout response saved as JSON. No admin credentials required.
(async () => {
    const filename = process.argv[2];
    assert.ok(filename, 'Usage: node tools/check-published-layout.cjs <layout.json>');
    const snapshot = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const result = await esbuild.build({
        stdin: {
            contents: "export * from './apps/game-client/assets/scripts/world/VillageModel'; export {applyNpcPack} from './apps/game-client/assets/scripts/world/NpcCatalog'; export {layoutErrors} from './apps/game-client/assets/scripts/world/SceneLayout';",
            resolveDir: path.resolve(__dirname, '..'), loader: 'ts',
        }, bundle: true, write: false, platform: 'node', format: 'cjs',
    });
    const module = {exports: {}};
    new Function('module', 'exports', 'require', result.outputFiles[0].text)(module, module.exports, require);
    const world = module.exports;
    assert.deepEqual(world.layoutErrors(snapshot.pack), [], 'Invalid object layout');
    world.applyLayoutGeometry(snapshot.pack.placements);
    assert.ok(world.applyNpcPack({version: 1, npcs: snapshot.npcs}, true), 'Invalid NPC configuration');
    const map = new world.VillageMap();
    map.configureLayout(snapshot.pack.placements);
    map.configureNpcs(snapshot.npcs);
    for (const npc of snapshot.npcs) {
        assert.ok(map.walkableForNpc(npc.x, npc.y, npc.id), npc.id + ': spawn blocked');
        assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([x, y]) =>
            map.path({x: 20, y: 20}, {x: npc.x + x, y: npc.y + y}).length > 0),
        npc.id + ': no approach path from village spawn');
    }
    console.log(`Layout revision ${snapshot.revision}: ${snapshot.npcs.length} NPC spawns and approach paths passed.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
