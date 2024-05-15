import { doFetch, likertPercentage } from "./services";

// button to toggle visibility of the svg element

export function getSVG(element, argConfig) {
    const defaults = { width: 1050, height: 600 };
    const config = { ...defaults, ...argConfig };
    return SVG().size('100%', '100%').addTo(element).size(config.width, config.height);

}

///////////////////////////////////////////// HTML DRAWING FUNCTIONS ///////////////////////////////////////

export function createHTMLButton(text, id, argConfig) {
    const defaults = {class: 'button', callback: () => console.log('Button clicked') };
    const config = { ...defaults, ...argConfig };
    const button = document.createElement('button');
    button.setAttribute('id', id);
    button.setAttribute('class', config.class);
    button.textContent = text;
    button.addEventListener('click', config.callback);
    return button;
}

///////////////////////////////////////////// SVG DRAWING FUNCTIONS ///////////////////////////////////////


export function origin(draw, x, y, argConfig) {
    // radius = 5, fillColor = 'red'
    const defaults = {radius: 5, fillColor: 'red'};
    const config = { ...defaults, ...argConfig };
    // Add a circle to the SVG drawing at the specified position
    draw.circle(config.radius * 2)  // The diameter is twice the radius
        .fill(config.fillColor)     // Set the fill color
        .center(x, y);       // Position the center of the circle at (x, y)
}

export function createSVGText(text, x, y, argConfig)  {
    const defaults = { anchor: 'left', size: 18, color: 'black' };
    const config = { ...defaults, ...argConfig };
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('fill', config.color);
    textElement.setAttribute('font-family', 'Arial');
    textElement.setAttribute('font-size', config.size);
    textElement.setAttribute('text-anchor', config.anchor);  // Centers text horizontally
    textElement.setAttribute('dominant-baseline', 'text-before-edge');  // Aligns text top to y coordinate
    textElement.textContent = text;
    return textElement;
}

export function rectWithText(draw, x, y, width, height, textFn, argConfig) {
    // Default configuration rx="2px", ry="2px",  textStroke ="white", fill = "gray", stroke = "black", strokeWidth = 1
    const defaults = { rx: 5, ry: 5, fontSize: 14, textStroke: 'white', rectFill: 'black', rectStroke: 'black', rectStrokeWidth: 1, 
                       callback: () => {console.log(`rectWithText "${textFn()}" clicked`)},
                       args: [] 
                     };
    const config = { ...defaults, ...argConfig };
    // Create a group and transform it to the specified x and y coordinates
    let group = draw.group().translate(x, y);

    // Add a rectangle to the group
    group.rect(width, height)
         .radius(config.rx, config.ry)           // Set the rounded corners
         .fill(config.rectFill)               // Set the fill color
         .addClass('clickable')
         .stroke({ width: config.rectStrokeWidth, color: config.rectStroke });  // Set the stroke width and color

    // Add text to the group, centered in the middle of the rectangle
    let text = group.text(textFn())
         .font({ anchor: 'middle', fill: config.textStroke, size: config.fontSize })  // Center the text horizontally and set the text color
         .addClass('clickable')
         .center(width / 2, height / 2);            // Move the text to the center of the rectangle

    // If a callback function is provided, add it to the group
    if (config.callback) {
        group.click(() => config.callback(text,...config.args));
    }
}


// Function to measure text width without rendering it visibly
function measureTextWidth(draw,text, fontFamily, fontSize) {
    // Create text element off-screen
    const textElement = draw.text(text).move(-1000, -1000).font({ family: fontFamily, size: fontSize });

    // Get the bounding box of the text, specifically the width
    const textWidth = textElement.bbox().width;

    // Remove the text element after measurement
    textElement.remove();

    return textWidth;
}

export function postIt(draw, text, x, y, maxWidth=100, lineHeight=18, maxHeight=50) {
    console.log('postIt:', text, x, y, maxWidth, lineHeight, maxHeight);
    const words = text.split(" ");
    console.log('- words:', words);

    let lineNumber = 0;
    let leftMargin = lineHeight/2;
    let topMargin = lineHeight/8;
    let size = lineHeight;
    let lineX = x + leftMargin;
    let lineY = y + topMargin;
    maxWidth = maxWidth - leftMargin;

    // holds the lines of text and x, y coordinates
    let lines = [];
    let line = '';
    let height = topMargin*3;
    words.forEach(function(word) {
        const testLine = line + word + ' ';
        // get the width of the text without rendering it
        const testWidth = measureTextWidth(draw, testLine, 'Arial', size);
        // console.log(testWidth, testLine, line, height, maxWidth);
        // If the line is too long, wrap the text
        if (testWidth > maxWidth) {
            lines.push({text: line});
            line = word + ' ';
            height += lineHeight*1.1;
        } else {
            line = testLine;
        }
        // draw.text(line).move(x+leftMargin, y + (lineNumber * lineHeight)).font({ family: 'Arial', size: size });
    });
    lines.push({text: line});
    height += lineHeight;
    // Create a group for the post-it note
    const group = draw.group();
    if (height < maxHeight) {
        height = maxHeight;
    }
    group.rect(120, height).attr({ fill: '#f9f79c', stroke: '#333', 'stroke-width': 2 }).move(x, y);
    // console.log({lines});
    lines.forEach(function(line) {
        const textElement = createSVGText(line.text, lineX, lineY, size, 'black');
        group.node.appendChild(textElement);
        lineY = lineY + lineHeight;
        // group.text(line.text).move(line.x, line.y).font({ family: 'Arial', size: size }).attr('dominant-baseline', 'text-before-edge');
    });
    // show hand cursor on hover
    group.addClass('clickable');
    // Make the group draggable
    group.draggable();
}

export function createBoardD3(draw, texts, boardWidth, boardHeight) {
    // assert texts is an array and not empty of an array of arrays
    if (!Array.isArray(texts) || texts.length === 0 || Array.isArray(texts[0])) {
        console.warn('Invalid input type for createBoardD3:', texts);
        return;
    }
    // log type of texts

    const nodes = texts.map(text => ({
        x: Math.random() * boardWidth*0.8,
        y: Math.random() * boardHeight*0.9,
        text: text
    }));

    console.log('nodes:', nodes);

    draw.rect(boardWidth, boardHeight).fill('white').stroke({ color: '#333', width: 2 });

    const simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX(d => d.x).strength(0.5))
        .force('y', d3.forceY(d => d.y).strength(0.5))
        .force('collide', d3.forceCollide(60)) // Adjust collision radius based on post-it size
        .stop();

    for (let i = 0; i < 120; ++i) simulation.tick(); // Run simulation to space out elements

    nodes.forEach(node => {
        console.log('Creating post-it:', node.text, node.x, node.y);
        postIt(draw, node.text, node.x, node.y, 110, 18);
    });
}


function createToggleVisibilityButton(target, argConfig) {
    const defaults = {class: 'clickable', text:":::", callback: () => console.log('Button clicked') };
    const config = { ...defaults, ...argConfig };
    const button = document.createElement('button');
    button.setAttribute('class', config.class);
    button.textContent = config.text;
    button.addEventListener('click', () => {
        console.log('Button clicked:', target);
        if (!(target instanceof Element)) {
            console.log('Target is not a valid DOM element:', target);
            return;
        }
        if (target.style.display === 'none') {
            target.style.display = 'block';
        } else {
            target.style.display = 'none';
        }
    });
    return button;
}



export async function resultsBoard(element, argConfig){
    console.log('resultsBoard', element, argConfig);
    const defaults = { width: 1050, height: 550, fieldname: 'answers',hidden: false};
    const config = { ...defaults, ...argConfig };
    // create an svg drawing by placing above icons in a grid using svg.js
    // check if id starts with #, otherwise add #
    const qid = element.getAttribute('data-ref');

    // create a div element to hold the svg element and the button
    const svgDiv = document.createElement('div');
    // create a button to toggle visibility of the svg element
    const button_visibility = createToggleVisibilityButton(svgDiv, {class: 'button'});
    // attach the them to the element
    element.appendChild(button_visibility);
    element.appendChild(svgDiv);
    // create a new svg drawing
    const draw = getSVG(svgDiv, config);


    // hide draw element if config.idden is true else show it
    if (config.hidden) {
        svgDiv.style.display = 'none';
    } else {
        svgDiv.style.display = 'block';
    }

    // fetch data from the server
    try {
        // console.log(`answers/${qid}`);
        
        const data = await doFetch(`answer/${qid}`, 'GET')
        console.log(`curl -X GET http://localhost:5050/answer/${qid} gives us ${data.answers}`);
        console.log(data);
        let texts = [];
        if ("warning" in data) {
            texts = ['No data available']; 
        } else {
            console.log('Data:', data);
            console.log('Fieldname:', config.fieldname);
            texts = data.answers; // [config.fieldname];
        }
        createBoardD3(draw, texts, config.width, config.height, 120, 18);
    } catch (error) {
        console.warn('Warning:', error);
    }
    // update the board via server-sent events
    console.log(`eventSource: A-${qid}`);
    eventSource.addEventListener(`A-${qid}`, function(event) {
        console.log('Event received:', event, event.data);
        // render json data
        const data = JSON.parse(event.data);
        draw.clear();
        createBoardD3(draw, data.answers, config.width, config.height, 120, 18);
    });
}

///////////////////////////////////////////// likert scale ///////////////////////////////////////

export function likertScale(draw, id) {
    const radius = 10;
    const spacing = 150;
    const labels = [
        "Stimme voll zu",
        "Stimme eher zu", 
        "Neutral", 
        "Stimme eher nicht zu", 
        "Stimme gar nicht zu"
    ];

    let x = 0;
    // Create rectangles and text labels for each point in the Likert scale
    for (let i = 0; i < 5; i++) {
        x = (i+1) * spacing;
        // Draw rectangle
        const c = draw.circle(radius * 2)
            .center(x, 30)
            .fill('white')
            .stroke({ width: 1, color: '#000' })
            // show hand on hover
            .addClass('clickable')
            .addClass('radio-box')
            // set id
            .attr({ id: `${id}-${i}` });

        // Add label below each rectangle
        const textElement = createSVGText(labels[i], x, 45,{ anchor: 'middle', size: 14, color: 'black' });
        draw.node.appendChild(textElement);
      
    }

    // Interaction with rectangles (optional)
    draw.find('.radio-box').click(function() {
        // console.log('Clicked on radio box');
        draw.find('.radio-box').fill('white'); // Reset all
        this.fill({ color: '#c0c0c0' });       // Highlight selected
        // post data to the server
        let value = this.attr('id').split('-')[1];
        doFetch('likert', 
                'POST', 
                {user:localStorage.getItem('nickname'), likert: id, value: value}, 
                (response) => {console.log(response);}
        );
        });
};


export function likertField(element,argConfig) {
    const draw = getSVG(element,{height:100});
    likertScale(draw,element.id);
}

export function showPercentage(element, live=true) {
    // create div element to hold the result
    const resultDiv = document.createElement('div');
    const updateResult = async () => {
        // get data for ref attribute
        let percentage = await likertPercentage(element.getAttribute('data-ref'));
        // console.log(percentage);
        // set the text content of the element
        resultDiv.textContent = `${percentage}%`;
    }
    if(live) {
        // show the result live
        element.appendChild(resultDiv);
        eventSource.addEventListener(
            `A-${element.getAttribute('data-ref')}`, 
            function(event) {
                // console.log('Event received:', event, event.data);
                const data = JSON.parse(event.data);
                resultDiv.textContent = `${data.percentage}%`;
            }); 


    } else {
        // show the result via a button click
        const resultButton = createHTMLButton( "Ergebnis", 
                                                `button-${element.getAttribute('data-ref')}`, 
                                                {
                                                    class: 'button', 
                                                    callback: updateResult
                                                })
        element.appendChild(resultButton);
        element.appendChild(resultDiv);
    }
}