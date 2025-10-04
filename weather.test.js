const request = require("supertest");
const app = require("./index");

describe("Prueba API OpenWeather", () => {
  it("Debe devolver datos del clima de Londres", async () => {
    const res = await request(app).get("/weather?city=London");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "London");
    expect(res.body).toHaveProperty("main");
    expect(res.body).toHaveProperty("weather");
  });
});
