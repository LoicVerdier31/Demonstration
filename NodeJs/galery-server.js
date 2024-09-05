const feathers = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const knex = require("knex");
const knexService = require("feathers-knex");
const sharp = require("sharp");
require('dotenv').config();

//Cors
const cors = require("cors");

//DB
const dbConfig = require("./knexfile.js");
const database = knex(dbConfig.development);

// Create a feathers instance.
const app = express(feathers());

//Enable cors
const corsOptions = {
  origin: [`${process.env.DEV_ORIGIN}`, `${process.env.PROD_ORIGIN}`],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Enable HTTP transport
app.configure(express.rest());

// HTTP compression
const compression = require("compression");
app.use(compression());

// JSON body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define the "Arrays" Knex service
const arraysService = knexService({
  Model: database,
  name: process.env.DATA_BASE,
});


//register the service as a route in feather
app.use(`${process.env.ROUTE_SERVICE}`, arraysService);

//multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: "image", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

// Feathers/Knex REST services
app.get("/", (request, response) => {
  response.send("Bienvenue sur le serveur !!");
});

// Crate new array
app.post(`${process.env.NEW_ARRAY}`, upload, async (request, response) => {
  try {
    const formData = request.body;
    const temporaryFiles = request.files;
    // Convert Bytea data to base64
    const formFiles = {};

    if (temporaryFiles.image !== undefined && temporaryFiles.image !== null) {
      formFiles.image641 = btoa(
        new Uint8Array(temporaryFiles.image[0].buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const compressedImageBuffer = await sharp(temporaryFiles.image[0].buffer)
        .resize(600, 600)
        .webp({ quality: 100 })
        .toBuffer();

      // base64 convert
      formFiles.imagecompressed = compressedImageBuffer.toString("base64");
    } else {
      formFiles.image641 = null;
    }

    if (temporaryFiles.image2 !== undefined && temporaryFiles.image2 !== null) {
      formFiles.image642 = btoa(
        new Uint8Array(temporaryFiles.image2[0].buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const compressedImageBuffer = await sharp(temporaryFiles.image2[0].buffer)
        .resize(600, 600)
        .webp({ quality: 100 })
        .toBuffer();

      //base64 convert resized img
      formFiles.image2compressed = compressedImageBuffer.toString("base64");
    } else {
      formFiles.image642 = null;
    }

    if (temporaryFiles.image3 !== undefined && temporaryFiles.image3 !== null) {
      formFiles.image643 = btoa(
        new Uint8Array(temporaryFiles.image3[0].buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
    } else {
      formFiles.image643 = null;
    }

    if (temporaryFiles.image4 !== undefined && temporaryFiles.image4 !== null) {
      formFiles.image644 = btoa(
        new Uint8Array(temporaryFiles.image4[0].buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
    } else {
      formFiles.image644 = null;
    }

    // Final array data
    const arrayData = {
      name: formData.name,
      order: formData.order,
      description: formData.description,
      dimension: formData.dimension,
      image: formFiles.image641,
      image2: formFiles.image642,
      image3: formFiles.image643,
      image4: formFiles.image644,
      type: formData.type,
      type2: formData.type2,
      serial: formData.serial,
      year: formData.year,
      price: formData.price,
      imagecompressed: formFiles.imagecompressed,
      image2compressed: formFiles.image2compressed,
    };

    const createdArray = await arraysService.create(arrayData);

    response.status(201).json(createdArray);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: "Erreur lors du traitement des données" });
  }
});
// modify array
app.post(`${process.env.MODIFY_ARRAY}`, upload, async (request, response) => {
  try {
    const formData = request.body;

    // Final array data
    const arrayData = {
      id: formData.id,
      name: formData.name,
      order: formData.order,
      description: formData.description,
      dimension: formData.dimension,
      type: formData.type,
      type2: formData.type2,
      serial: formData.serial,
      year: formData.year,
      price: formData.price,
    };

    const createdArray = await arraysService.patch(arrayData.id, arrayData);

    response.status(201).json(createdArray);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: "Erreur lors du traitement des données" });
  }
});
// delete array
app.post(`${process.env.DELETE_ARRAY}`, upload, async (request, response) => {
  try {
    const formData = request.body;

    // Final array data
    const arrayData = {
      id: formData.id,
    };

    const createdArray = await arraysService.remove(arrayData.id);

    response.status(201).json(createdArray);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: "Erreur lors de la suppression des données" });
  }
});

// Start the server 
app.listen(process.env.PORT, () => console.log(`listening on port ${process.env.PORT}`));
