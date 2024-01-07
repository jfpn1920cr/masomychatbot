require("dotenv").config();
const axios = require("axios");
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

// const getInfoLink = async () => {

//         // return result2;

// }

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const flujoGetInfoLink = addKeyword([
  "Hola",
  "ola",
  "oal",
  "verificar",
  "buenas",
  "reintetar",
])
  .addAnswer("🙌 Hola bienvenido al chatbot de  *MASOMY*")
  .addAnswer(
    "Este chatbot esta en fase Beta solo podra Verificar links de pago, para esto escribe acontinuacion la referencia de pago a validar: ",
    { capture: true },
    async (ctx, { flowDynamic }) => {
      // let data = await getInfoLink();
      // console.log(data);

      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Content-Type", "application/json");

      var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };
      let result2 = null;
      fetch(
        "http://masomyadmin.test/api/getLinkByReferenceCodeId/" + ctx.body,
        requestOptions
      )
        .then((response) => response.text())
        .then(async (result) => {
          result = JSON.parse(result);
          // console.log(JSON.parse(result).success) ;
          // console.log(JSON.stringify(result).success) ;

          if (result.success) {
            console.log("si");
            let textRespEstadoPago = "";
            let textRespProducts = "";
            if (result.typeOrder == "Order") {
              textRespEstadoPago =
                "Tu Orden esta Registrada Correctamente y en estado : (" +
                result.orden.status +
                ")";
              // textRespProducts = ;
              let i = 0;
              result.products.forEach((element) => {
                i++;
                textRespProducts +=
                  "*--Producto #" +
                  i +
                  "--* \n Nombre:  " +
                  element.producto.name +
                  "\nCantidad: " +
                  element.detail.quantity +
                  "\nSubtotal: " +
                  element.detail.subtotal +
                  "\nDescuento: " +
                  element.detail.disccount +
                  "\ntotal: " +
                  element.detail.total;
              });
            } else {
              textRespEstadoPago =
                "Tu orden esta pre rgistrada pero no ha sido aprobada porque el pago no ha concluido.  ";

              let i = 0;
              result.products.forEach((element) => {
                i++;
                textRespProducts +=
                  "*--Producto " +
                  i +
                  "--* \n*Nombre:*  " +
                  element.producto.name +
                  "\n*Cantidad:* " +
                  element.detail.quantity +
                  "\n*Subtotal:* " +
                  element.detail.subtotal +
                  "\n*Descuento:* " +
                  element.detail.disccount +
                  "\n*total:* " +
                  element.detail.total;
              });
            }
            await flowDynamic([
              {
                body:
                  "*Referencia*: 20231123232226VySiM \n" +
                  "*Estado del pago* :" +
                  result.linkPay.status,
              },
              { body: textRespEstadoPago },
              { body: "Este Fue tu pedido: \n  " + textRespProducts },
            ]);
          } else {
            await flowDynamic([
              {
                body: "Tu Link de pago no existe, escribe *reintentar* Para consultar nuevamente",
              },
            ]);
          }
        })
        .catch((error) => console.log("error", error));
    }
  );
// .addAnswer('Obteniendo info del link', null,

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flujoGetInfoLink]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
