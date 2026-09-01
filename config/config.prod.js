window.env = {
  environment: "production",
  keycloak: {
    clientId: "fe-identity",
    realm: "m2",
    url: "https://auth.eva-core.com",
  },
  backend: {
    // TODO: api-identity hoy no está publicado en la red de la Pi (solo lo consumen
    // api-movements/api-keep dentro de la red interna de Docker) — hay que agregarle un
    // port mapping al docker-compose de la Pi (ej. "8090:8081") y actualizar esta URL con
    // la IP/puerto reales antes de deployar este frontend.
    api: "http://192.168.1.33:8090/v1",
  },
};
