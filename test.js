import { Client } from "@gradio/client";

(async () => {
  const response_0 = await fetch(
    "https://airi-institute-hairfastgan.hf.space/file=/tmp/gradio/90e42560c5b2e8086c47fe34f0b20599a26abb71/1.png"
  );
  const exampleImage1 = await response_0.blob();

  const response_1 = await fetch(
    "https://airi-institute-hairfastgan.hf.space/file=/tmp/gradio/963de1f5ba98a79e8c1bafc1184348d8f056a7ee/2.png"
  );
  const exampleImage2 = await response_1.blob();

  const client = await Client.connect("AIRI-Institute/HairFastGAN");

  console.log("Resizing face image...");
  const faceResizeResult = await client.predict("/resize_inner", {
    img: exampleImage1,
    align: ["Face", "Shape", "Color"],
  });
  const faceResizedResponse = await fetch(faceResizeResult.data[0].url);
  const resizedFace = await faceResizedResponse.blob();

  let resizedShape = null;
  let resizedColor = null;
  if (exampleImage2) {
    console.log("Resizing shape image...");
    const shapeResizeResult = await client.predict("/resize_inner", {
      img: exampleImage2,
      align: ["Face", "Shape", "Color"],
    });
    const shapeResizedResponse = await fetch(shapeResizeResult.data[0].url);
    resizedShape = await shapeResizedResponse.blob();
    // Set color to null if shape is provided
    resizedColor = null;
  } else if (/* if logic needed to consider color separately */ false) {
    console.log("Resizing color image...");
    const colorResizeResult = await client.predict("/resize_inner", {
      img: exampleImage2,
      align: ["Face", "Shape", "Color"],
    });
    const colorResizedResponse = await fetch(colorResizeResult.data[0].url);
    resizedColor = await colorResizedResponse.blob();
  }

  console.log("Calling swap_hair with resized images...");
  const result = await client.predict("/swap_hair", {
    face: resizedFace,
    shape: resizedShape,
    color: resizedColor,
    blending: "Article",
    poisson_iters: 0,
    poisson_erosion: 1,
  });

  console.log(result.data[0].value.url);

  const result2 = await client.predict("/resize_inner", {
    img: exampleImage1,
    align: ["Face", "Shape", "Color"],
  });
  console.log(result2.data[0].url);
})();
