import cuid from "cuid";

let x = 0;
while (x <= 10) {
  console.log(`${x}. ${cuid()}`);
  x++;
}
