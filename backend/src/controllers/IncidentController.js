const connection = require('../database/connection');

module.exports = {

  async index(request, response) {
    const { page = 1} = request.query;

    const [count] = await connection('incidents').count();
    //console.log(count);
    const incidents = await connection('incidents')
    .limit(5)
    .join('ongs','ongs.id','=','incidents.ong_id')
    .offset((page-1)*5)
    .select('incidents.*','ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf');
    response.header('X-Total-Count' , count['count(*)']);
    return response.json(incidents);

  },


  async create(request, response) {
    const body = request.body;
    console.log(body);

    const { title, description, value, ativo } = request.body;

    const ong_id = request.headers.authorization;
    console.log(ong_id);

    const [id] = await connection('incidents').insert({
      title,
      description,
      value,
      ong_id,
      ativo,
    });

    return response.json({ id });

  },

  async delete(request, response) {
    const { id } = request.params;
    const ong_id = request.headers.authorization;
    const incident = await connection('incidents')
      .where('id', id)
      .select('ong_id')
      .first();

      if (incident == null) {
        return response.status(404).json({ error: 'Id not Found' });
      }

    
    if (incident.ong_id != ong_id) {
      return response.status(401).json({ error: 'Operation not permitted.' });
    }
    await connection('incidents').where('id',id).delete();
    return response.status(204).send();


  }


};
