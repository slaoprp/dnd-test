
const root = document.getElementById("root")  
let rectangle = document.getElementsByClassName("rectangle")[0];
let child = document.getElementsByTagName("li")[0];
const container = document.getElementById("container");
const popin = document.getElementById("popin");
let childCounter = 1;

const blue = "#2781CA";
const green = "#76FF76";
const red = "#E94A4A";
const yellow = "#E2E276";


const canvas = document.getElementById("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext('2d');
ctx.strokeStyle = red;
ctx.lineWidth = 3;    
    
/**
 * Structure de données "Arbre" qui permet de gérer tout le système algorithmique de mind map
 */
let tree = {
    node: root,
    children:[]
}
    
/**
 * Cherche le noeud qui englobe l'element "element" dans l'abre tree
 * @param {*} element 
 * @param {*} tree 
 * @returns 
 */
function findParent(element, tree){
    if (element == tree.node)
        return tree
    else{
        for (child of tree.children){
            findParent(element, child);                
            if (child.node == element)
                return child;                    
        }
    }
    return null;
}

function isLeaf(element){
    return element.children.length == 0;
}

function removeElementFromTree(element, tree){
    for (child of tree.children){
        if (child.node == element.node && child.children == element.children){
            tree.children = tree.children.filter(function (ele) {
                return ele.node != child.node && ele.children != child.children;
            });
            return true;
        }
    }
    for (child of tree.children){
        removeElementFromTree(element, child);
        if (child.node == element.node && child.children == element.children){
            tree.children = tree.children.filter(function (ele) {
                return ele.node != child.node && ele.children != child.children;
            });
            return true;
        }
    }       
    return false;    
}

function getChildren(element){  
    return element.children;
}


/**
 * Cette fonction permet de rajouter un un enfant
 * @param elem : Ce paramètre est l'élément boutton qui est cliqué 
 */
function addChild(elem){
    childCounter++;
    
    const currentRectangle = elem.parentNode;
    const newRectangle = currentRectangle.cloneNode(true);
    let nested = undefined;
    let li = undefined;
    if (currentRectangle.nextElementSibling == undefined){
        nested = document.createElement("ul");
        nested.className = "nested";                       
    } else {            
        nested = currentRectangle.nextElementSibling;                 
    }   

    li = document.createElement("li");
    li.appendChild(newRectangle);
    nested.appendChild(li);

    function insertAfter(newNode, currentNode){
        let liParent = currentNode.parentNode;
        liParent.insertBefore(newNode, currentNode.nextSibling);
    }
    insertAfter(nested, currentRectangle);
    let elementRoot = findParent(elem.parentNode, tree);
    let toBePushed = {node: newRectangle, children: []};
    elementRoot.children.push(toBePushed);
    
    if (elementRoot.children.length == 3){            
        elem.style.visibility = 'hidden';
    }
    if (childCounter > 10){
        container.style.width = "200";
        container.style.height = "200%";
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;
        ctx.strokeStyle = 'rgb(212, 114, 106)';
        ctx.lineWidth = 3;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(tree);
}


function drawTree(tree){
    children = getChildren(tree);
    
    for (child of children){
        drawLine(tree.node, child);
        drawTree(child);
    }
}            

function drawLine(node, child){
    
    const getOffset = (el) => {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    }
    const off1 = getOffset(node);
    const off2 = getOffset(child.node);

    const x1 = off1.left + off1.width - 8;
    const y1 = off1.top + off1.height / 2 - 5;
    
    const x2 = off2.left;
    const y2 = off2.top + off2.height / 2 - 5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + 30, y1);

    ctx.moveTo(x1 + 30, y1);
    ctx.lineTo(x1 + 30, y2);

    ctx.moveTo(x1 + 30, y2);
    ctx.lineTo(x2, y2);    
    ctx.stroke();
    
}

let selectedRectangle = undefined;
let radius = document.getElementById("radius");

function reduceRadius(){
    radius.innerText = parseInt(radius.innerText) - 1;
    if(selectedRectangle != undefined){
        selectedRectangle.style.borderRadius = radius.innerText + "px";
    }    
}

function addRadius(){
    radius.innerText = parseInt(radius.innerText) + 1;
    if(selectedRectangle != undefined){
        selectedRectangle.style.borderRadius = radius.innerText + "px";
    }
}

function copyTitle(elem){
    if(selectedRectangle != undefined){
        selectedRectangle.children[0].value = elem.value;
    }
    
}

function saveRectangle(elem){   
    selectedRectangle = elem;
}

function coloriseRectangle(color){
    if (selectedRectangle != undefined){
        selectedRectangle.style.borderColor = color;
        selectedRectangle.children[1].style.borderColor = color;
    } else {
        alert("No Node selected");
    }
}


function applyColor(elem){
    switch(elem.attributes.id.value){
        case 'blue':
            coloriseRectangle(blue);
            break;
        case 'red':
            coloriseRectangle(red);
            break;
        case 'green':
            coloriseRectangle(green);
            break;
        case 'yellow':
            coloriseRectangle(yellow);
            break;
    }
    
}

/**
 * Cette fonction permet de supprimer un enfant
 */
function removChild(){
    if(selectedRectangle != undefined){
        childCounter--;
        let rec = {node: selectedRectangle, children: findParent(selectedRectangle, tree).children};
        if(selectedRectangle.nextSibling != null)
            selectedRectangle.nextSibling.remove();
        selectedRectangle.remove();
        removeElementFromTree(rec, tree);
        checkButtons(tree);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTree(tree);
        
    }
}

/**
 * Lorsque un noeud a 3 enfants, le boutton + est supprimé, cependant, on peut supprimer un enfant de ce noeud
 * Cette fonction se charge de remettre le boutton + aux noeuds ayant moins de 3 enfants
 */
function checkButtons(tree){
        if(tree.children.length < 3){
            tree.node.children[1].style.visibility = 'visible';
        }
        for(child of tree.children){
            checkButtons(child);
            if(tree.children.length < 3){
                tree.node.children[1].style.visibility = 'visible';
            }
        }    
}

// window.onresize = () =>{
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     drawTree(tree);
// }