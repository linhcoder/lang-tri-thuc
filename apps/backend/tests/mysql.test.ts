import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MySqlRepository} from '../src/Store';
test('MySQL rollback, concurrent row locking, Vietnamese JSON and durable reconnect',{skip:!process.env.MYSQL_TEST_URL},async()=>{
    const url=process.env.MYSQL_TEST_URL!;
    assert.ok(new URL(url).pathname.endsWith('_test'),'Never mutate the live application database');
    const db=new MySqlRepository(url),peer=new MySqlRepository(url);
    try{
        const before=await db.transaction(d=>structuredClone(d));
        await assert.rejects(db.transaction(d=>{d.results.push('must-rollback');throw Error('rollback');}));
        assert.deepEqual(await db.transaction(d=>d),before);
        const id='mysql-concurrency-test';await db.transaction(d=>{d.progress[id]={revision:0,data:{text:'Làng Tri Thức • Bác Nông Dân 🌾'},receipts:[]};});
        await Promise.all(Array.from({length:20},(_,i)=>(i%2?db:peer).transaction(async d=>{const revision=d.progress[id].revision;await new Promise(r=>setTimeout(r,5));d.progress[id].revision=revision+1;})));
        assert.equal(await db.transaction(d=>d.progress[id].revision),20);
        await peer.close();const reopened=new MySqlRepository(url);
        try{assert.deepEqual(await reopened.transaction(d=>d.progress[id].data),{text:'Làng Tri Thức • Bác Nông Dân 🌾'});await reopened.transaction(d=>{delete d.progress[id];});}finally{await reopened.close();}
    }finally{await db.close();await peer.close();}
});
