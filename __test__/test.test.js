
const request = require('supertest')
let url='http://localhost:8085'



describe("Pruebas de API", () => {
  it("Debe devolver una lista de usuarios", (done) => {
      request(url)
          .get('/usuarios')
          .end((err, res) => {
              expect(res.statusCode).toBe(200);
              done();
          });
  });

  it('Prueba scaffolding', () => {
    expect(true).toBe(true);
  });
  
});

