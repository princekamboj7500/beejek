// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import webhookSubscription from "./webhooks.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot()
// );
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async(req, res, next) => {
    console.log(res.locals.shopify.session);
	  await webhookSubscription(res.locals.shopify.session);

    var token = res.locals.shopify.session.accessToken;
    var shop = res.locals.shopify.session.shop;
    return res.redirect(`https://www.beejek.com/#/merchant?type=signup&partner_code=BTBSB0AO76&code=${token}&store_id=${shop}`);
    // next();
  },
  shopify.redirectToShopifyOrAppRoot(),
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.validateAuthenticatedSession(), async (_req, res, _next) => {
  var token = res.locals.shopify.session.accessToken;
  var shop = res.locals.shopify.session.shop;
  return res.redirect(`https://www.beejek.com/#/merchant?type=signup&partner_code=BTBSB0AO76&code=${token}&store_id=${shop}`);


  // return res
  //   .status(200)
  //   .set("Content-Type", "text/html")
  //   .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
