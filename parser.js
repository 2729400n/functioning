import fs from "fs";


const a = () => 0;
const add = (x, y) => x + y;
const mul = (x, y) => x * y;
const pow = (x, y) => x ** y;
const and = (x, y) => x & y;
const x_then_y_or_z = (x, y, z) => x ? y() : z();
const charcodeaty = (x, y) => x.charCodeAt(y);
const lengthOf = (x) => x.length;

let filer = fs.readFileSync("chal.js", { encoding: "utf8" })




let regex_1 = /(a)\s*\(\)/g
let regex_2 = /(pow)\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\)/g
let regex_3 = /(add)\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\)/g
let regex_4 = /(mul)\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\)/g
let regex_5 = /(and)\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\)/g

let regexes = [
    regex_1,
    regex_2,
    regex_3,
    regex_4,
    regex_5
]

function add_func(a_,b_) {
    let a = Number.parseInt(a_)
    let b = Number.parseInt(b_)

    return (a+b).toString().trim()

}
function mul_func(a_,b_) {
    let a = Number.parseInt(a_)
    let b = Number.parseInt(b_)

    return (a*b).toString().trim()

}
function pow_func(a_,b_) {
    let a = Number.parseInt(a_)
    let b = Number.parseInt(b_)

    return (a**b).toString().trim()

}
function and_func(a_,b_) {
    let a = Number.parseInt(a_)
    let b = Number.parseInt(b_)

    return (a&b).toString().trim()

}

function namer(str) {

    let ostr = String(str)
    let val = "";
    for (let i = 0; i < 1000; i++) {
        // console.log(ostr)
        let matches = ostr.matchAll(regexes[i % regexes.length])
        for (const match of matches) {
            let func = match[1];
            switch (func) {
                case "a":
                    val = "0"
                    break
                case "add":
                    val = add_func(match[2], match[3]);
                    break;
                case "mul":
                    val = mul_func(match[2], match[3]);
                    break;
                case "pow":
                    val = pow_func(match[2], match[3]);
                    break;
                case "and":
                    val = and_func(match[2], match[3]);
                    break;
            }
            ostr=ostr.replace(match[0], val)
        }

    }
    return ostr
}

let regex_6 = /x_then_y_or_z\(\s*([A-z][A-z0-9])\s*,\s*([0-9])\)/g
let regex_7 = /charcodeaty\(\s*([0-9])\s*,\s*([0-9])\)/g
let regex_8 = /lengthOf\(\s*([0-9])\s*,\s*([0-9])\)/g
console.log("\n")
console.log(namer(filer))