// search for given socket.id
let search = (db, socket_id, games) => { // might have to better
    for (let i = 0; i < games; i++) {
        db.query(`SELECT *
            FROM ${games.get(i)}
            WHERE student_name + age + student_id + class LIKE '%left%';
        `)
    }
}