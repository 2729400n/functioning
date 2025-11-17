import fs from "fs";

// --- Original Simple Functions (Unused in final parser) ---
// const a = () => 0; // 0
// const b = (x, y) => x + y; // add
// const c = (x, y) => x * y; // mul
// const d = (x, y) => x ** y; // pow
// const e = (x, y) => x & y; // and
// const f = (x, y, z) => x ? y() : z(); // x_then_y_or_z
// const g = (x, y) => x.charCodeAt(y); // charcodeaty
// const h = (x) => x.length; // lengthOf
// const A = (x, y) => ((y * 255 + x) & 0xff); // Custom A
// const B = (x, y) => ((x + y * 65535) & 0xffff); // Custom B

// --- Updated Regexes to match single-letter aliases in chal__.js ---
// Note: We use capturing groups (2) and (3) for function args.
const regex_a = /(a)\s*\(\s*\)/g;                                      // a()
const regex_d = /(d)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // d(..., ...) for pow
const regex_b = /(b)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // b(..., ...) for add
const regex_c = /(c)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // c(..., ...) for mul
const regex_e = /(e)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // e(..., ...) for and
const regex_A = /(A)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // A(..., ...)
const regex_B = /(B)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // B(..., ...)
const regex_g = /(g)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g;                 // g(..., ...) for charcodeaty
const regex_h = /(h)\s*\(\s*(.+?)\s*\)/g;                            // h(...) for lengthOf
const regex_f = /(f)\s*\(\s*(.+?)\s*,\s*(\(\)\s*=>\s*.+?)\s*,\s*(\(\)\s*=>\s*.+?)\s*\)/g; // f(cond, () => if_true, () => if_false)

// Ordered list of regexes to prioritize inner functions first.
// f is complex and should be handled separately or last in a loop.
let regexes = [
    regex_a,
    regex_h,
    regex_d, // pow
    regex_b, // add
    regex_c, // mul
    regex_e, // and
    regex_g, // charcodeaty
    regex_A,
    regex_B,
    // regex_f is handled in the main loop to ensure its args are simple first
];

// --- Evaluation Functions ---

function add_func(a_, b_) {
    let a = Number(a_);
    let b = Number(b_);
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(b(${a_}, ${b_}))`.trim(); // Revert to function call if not fully constant
    }
    return (a + b).toString().trim();
}

function mul_func(a_, b_) {
    let a = Number(a_);
    let b = Number(b_);
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(c(${a_}, ${b_}))`.trim();
    }
    return (a * b).toString().trim();
}

function pow_func(a_, b_) {
    let a = Number(a_);
    let b = Number(b_);
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(d(${a_}, ${b_}))`.trim();
    }
    // Optimization: a() is 0. 0**0 = 1, 0**x=0. This only appears with a()
    if (a === 0 && b === 0) return '1'; 
    if (a === 0 && b > 0) return '0';
    return (a ** b).toString().trim();
}

function and_func(a_, b_) {
    let a = Number(a_);
    let b = Number(b_);
    if ((Number.isNaN(a)) || (Number.isNaN(b))) {
        return `(e(${a_}, ${b_}))`.trim();
    }
    return (a & b).toString().trim();
}

function A_func(a_, b_) {
    let x = Number(a_);
    let y = Number(b_);
    if ((Number.isNaN(x)) || (Number.isNaN(y))) {
        // Unsimplified expression (y * 255 + x) & 0xff
        return `((b(c(${b_}, 255), ${a_}) & 0xff))`.trim();
    }
    return ((y * 255 + x) & 0xff).toString().trim();
}

function B_func(a_, b_) {
    let x = Number(a_);
    let y = Number(b_);
    if ((Number.isNaN(x)) || (Number.isNaN(y))) {
        // Unsimplified expression (x + y * 65535) & 0xffff
        return `((b(${a_}, c(${b_}, 65535)) & 0xffff))`.trim();
    }
    return ((x + y * 65535) & 0xffff).toString().trim();
}

// charcodeaty (g) and lengthOf (h) are not simplified since they depend on runtime strings (x)
function charcodeaty_func(a_, b_) {
    return `(g(${a_}, ${b_}))`;
}

function lengthOf_func(a_) {
    return `(h(${a_}))`;
}

function namer(str) {
    let ostr = String(str);
    let changed = true;

    // Loop until no more constant expressions can be simplified
    for (let xzy =0 ;xzy<1000;xzy++) {
        changed = false;
        
        // 1. Process all constant-generating and math functions
        for (let regex of regexes) {
            let original = ostr;
            let matches = [...ostr.matchAll(regex)];
            
            // Iterate in reverse to avoid issues with replacement indices
            for (const match of matches.reverse()) {
                let func = match[1];
                let val = match[0]; // default is to keep original match[0]

                switch (func) {
                    case "a":
                        val = "0";
                        break;
                    case "b":
                        val = add_func(match[2], match[3]);
                        break;
                    case "c":
                        val = mul_func(match[2], match[3]);
                        break;
                    case "d":
                        val = pow_func(match[2], match[3]);
                        break;
                    case "e":
                        val = and_func(match[2], match[3]);
                        break;
                    case "A":
                        val = A_func(match[2], match[3]);
                        break;
                    case "B":
                        val = B_func(match[2], match[3]);
                        break;
                    case "g":
                        val = charcodeaty_func(match[2], match[3]);
                        break;
                    case "h":
                        val = lengthOf_func(match[2]);
                        break;
                    default:
                        val = match[0]; // should not happen with current regex list
                }
                
                // If the function was evaluated to a constant, replace it.
                if (val !== match[0]) {
                    // Replace only the *first* occurrence found by matchAll, as subsequent matches might overlap
                    // We must use a precise replacement mechanism since standard replace() replaces all.
                    const index = match.index;
                    ostr = ostr.substring(0, index) + val + ostr.substring(index + match[0].length);
                    changed = true;
                }
            }
        }
        
        // 2. Process the conditional function 'f' last, as it collapses the structure.
        let f_original = ostr;
        let f_matches = [...ostr.matchAll(regex_f)];
        
        for (const match of f_matches.reverse()) {
            let condition = Number(match[2]);
            let true_branch = match[3];
            let false_branch = match[4];

            if (!Number.isNaN(condition)) {
                let result = condition ? true_branch : false_branch;
                
                // Remove the lambda syntax wrappers
                result = result.replace(/^\(\)\s*=>\s*/, '');
                result = result.replace(/;$/, '');

                const index = match.index;
                ostr = ostr.substring(0, index) + result + ostr.substring(index + match[0].length);
                changed = true;
            }
        }
    }
    return ostr;
}

// --- Main Execution Block ---

// Define the file name to process within the provided code structure.
let filer = "chal__.js";

console.log(`\n=== ${filer}====\n`);

// Load the content of chal__.js (assuming it's in the same directory for this environment)
let file_content = `
// You may have to increase the max stack size:
// node --stack_size=#### chal.js

const a = () => 0;
const b = (x, y) => x + y;
const c = (x, y) => x * y;
const d = (x, y) => x ** y;
const e = (x, y) => x & y;
const f = (x, y, z) => x ? y() : z();
const g = (x, y) => x.charCodeAt(y);
const h = (x) => x.length;

const A = (x, y) => e(b(c(b(c(b(d(a(), a()), d(a(), a())), b(d(a(), a()), d(b(d(a(), a()), d(a(), a())), b(d(a(), a()), d(a(), a()))))), d(a(), a())), c(y, b(d(a(), a()), b(c(b(c(b(d(a(), a()), d(a(), a())), b(b(d(a(), a()), d(a(), a())), d(a(), a()))), d(a(), a())), b(d(a(), a()), b(d(a(), a()), d(a(), a())))), d(a(), a()))))), b(x, c(y, b(d(a(), a()), d(a(), a()))))), c(c(b(b(d(a(), a()), d(a(), a())), d(a(), a())), b(d(a(), a()), c(b(d(a(), a()), d(a(), a())), b(d(a(), a()), d(a(), a()))))), b(d(b(d(a(), a()), d(a(), a())), c(b(d(a(), a()), d(a(), a())), b(d(a(), a()), d(a(), a())))), d(a(), a()))));
const B = (x, y) => e(c(A(a(), d(a(), a())), b(d(a(), a()), d(b(d(a(), a()), d(a(), a())), d(b(d(a(), a()), d(a(), a())), b(b(d(a(), a()), d(a(), a())), d(a(), a())))))), b(x, c(c(A(a(), d(a(), a())), y), b(d(a(), a()), d(b(d(a(), a()), d(a(), a())), d(b(d(a(), a()), d(a(), a())), b(b(d(a(), a()), d(a(), a())), d(a(), a()))))))));
const C = (x, y) => f(A(x, y), () => f(x, () => C(A(x, d(a(), a())), y), a), () => d(a(), a()));
const D = (x, y) => f(B(x, A(x, a())), () => D(B(B(x, d(b(d(a(), a()), d(a(), a())), d(b(d(a(), a()), d(a(), a())), b(d(a(), a()), b(d(a(), a()), d(a(), a())))))), A(x, a())), B(y, d(a(), a()))), () => y);
const E = (x) => B(a(), D(x, a()));
const F = (x, y) => f(B(B(x, A(x, a())), B(y, A(y, a()))), () => C(E(x), E(y)), () => C(A(x, a()), A(y, a())));
const G = (x, y, z) => f(F(x, y), () => G(B(x, y), y, B(z, B(a(), d(a(), a())))), () => z);
const H = (x, y) => G(x, y, a());
const I = (x, y) => B(x, c(y, H(x, y)));

`;

let out = namer(file_content);
console.log(out);

// To save the output to a file:
fs.writeFileSync(`chal__yolked.js`, out);