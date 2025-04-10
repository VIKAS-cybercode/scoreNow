//indexing on auth0Id in players table
//for fast lookup on auth0Id
//psql we can create multiple indexing
//psql bydefault make an index on primary key
// create index like:   CREATE UNIQUE INDEX idxUserAuth0Id ON players(auth0Id)
// psql does not automatically cluster data on primary key
//to cluster data :  CLUSTER players USING playerId