import fs from "fs";


const a = () => 0;
const add = (x, y) => x + y;
const mul = (x, y) => x * y;
const pow = (x, y) => x ** y;
const and = (x, y) => x & y;
const x_then_y_or_z = (x, y, z) => x ? y() : z();
const charcodeaty = (x, y) => x.charCodeAt(y);
const lengthOf = (x) => x.length;

let filer = "x_then_y_or_z(A(x, y), () => x_then_y_or_z(x, () => C(A(x, pow(a(), a())), y), a), () => pow(a(), a()));";
//fs.readFileSync("chal_C.js", { encoding: "utf8" })




let regex_1 = /(a)\s*\(\s*\)/g
let regex_2 = /(pow)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_3 = /(add)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_4 = /(mul)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_5 = /(and)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_A = /(A)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_B = /(B)\s*\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_7 = /charcodeaty\(\s*(.+)\s*,\s*(.+)\s*\)/g
let regex_8 = /lengthOf\(\s*(.+)\s*\)/g

let regexes = [
    regex_1,
    regex_2,
    regex_3,
    regex_4,
    regex_5,
    regex_7,
    regex_A,
    regex_B
]

function add_func(a_, b_) {
    let a = Number(a_)
    let b = Number(b_)
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(${a_} + ${b_})`.trim()
    }

    return (a + b).toString().trim()

}
function mul_func(a_, b_) {
    let a = Number(a_)
    let b = Number(b_)
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(${a_} * ${b_})`.trim()
    }
    return (a * b).toString().trim()

}
function pow_func(a_, b_) {
    let a = Number(a_)
    let b = Number(b_)
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(${a_} ** ${b_})`.trim()
    }
    return (a ** b).toString().trim()

}

function and_func(a_, b_) {
    let a = Number(a_)
    let b = Number(b_)
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(${a_} & ${b_})`.trim()
    }
    return (a & b).toString().trim()

}

function A_func(a_, b_) {
    let x = Number(a_)
    let y = Number(b_)
    if ((Number.isNaN(x)) || (Number.isNaN(y))) {
        return `( (${b_} * 255 + ${a_}) & 0xff)`.trim()
    }
    return ((y * 255 + x) & 0xff).toString().trim()

}
function B_func(a_, b_) {
    let x = Number(a_)
    let y = Number(b_)
    if ((Number.isNaN(x)) || (Number.isNaN(y))) {
        return `((${a_} + ${b_} * 65535) & 0xffff)`.trim()
    }
    return ((x + y * 65535) & 0xffff).toString().trim()

}
function charcodeaty_func(a_, b_) {
    return `(${a_}.charCodeAt(${b_}))`

}


function namer(str) {

    let ostr = String(str)
    let val = "";
    for (let i = 0; i < 1000; i++) {
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
                case "A":
                    val = A_func(match[2], match[3]);
                    break;
                case "B":
                    val = B_func(match[2], match[3]);
                    break;
                case "x_then_y_or_z":
                    val = x_then_y_or_z_func(match[2], match[3], match[4]);
                    break;
                default:
                    val = match[0]

            }
            ostr = ostr.replace(match[0], val)
        }

    }
    return ostr
}

for(let itt of ["A","B","C","D","E"]){
    filer = `chal_${itt}.js`;
    console.log(`\n=== ${filer}====\n`)
    let out =namer(fs.readFileSync(filer, "utf8"))
    console.log(out);

    fs.writeFileSync(`chal_${itt}_yolked.js`,out)
}