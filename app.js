// Initialize the scene, camera, and renderer with antialiasing enabled
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Set higher pixel ratio for sharper rendering
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Set the background color of the scene to white
scene.background = new THREE.Color(0x808080); // White background 0xffffff

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Camera definition

// Scaling constants to control the spread of the HR diagram
const tempScale = 0.055;    // Adjust to control the X axis (temperature), linear scale
const lumScale = 60;      // Adjust to control the Y axis (luminosity)
const sizeScale = 2;     // Smaller size to resemble s=1 in matplotlib

// Temperature range for the X-axis
const minTemperature = 2000;
const maxTemperature = 14000; // Set the max temperature to 14,000 to match matplotlib plot

// Luminosity range for the Y-axis
const minLuminosity = 0.0001;
const maxLuminosity = 10000;

let raycaster = new THREE.Raycaster(); // Create a raycaster
let mouse = new THREE.Vector2(); // Store the mouse position
let stars = []; // Array to store all the star meshes for raycasting

// Add an event listener for mouse clicks
document.addEventListener('click', onMouseClick, false);

// Function to handle mouse click
function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections between the ray and the stars
    const intersects = raycaster.intersectObjects(stars);

    // If an intersection is detected, display the star's data
    if (intersects.length > 0) {
        const selectedStar = intersects[0].object;
        displayStarInfo(selectedStar.userData); // Display star info
    }
}

// Function to display the selected star's information
function displayStarInfo(starData) {
    // Create or update an HTML element to display the data
    let infoBox = document.getElementById('star-info');
    if (!infoBox) {
        infoBox = document.createElement('div');
        infoBox.id = 'star-info';
        infoBox.style.position = 'absolute';
        infoBox.style.top = '20px';
        infoBox.style.right = '20px';
        infoBox.style.padding = '10px';
        infoBox.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        infoBox.style.border = '1px solid black';
        document.body.appendChild(infoBox);
    }

    // Update the infoBox with the selected star's data
    infoBox.innerHTML = `
        <strong>Star:</strong> HIP${starData.hip}<br>
        <strong>Luminosity:</strong> ${starData.luminosity.toFixed(4)} L_Sun<br>
        <strong>Temperature:</strong> ${starData.temperature.toFixed(0)} K
    `;
}

// Function to create the correct X and Y axes
// Function to create tick marks for the X-axis
function addXTicks() {
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color for tick marks

    const tickLength = 10; // Length of each tick mark
    const temperatures = [3000, 5000, 7000, 9000, 11000, 13000]; // Tick positions at 5000-degree intervals

    temperatures.forEach(temp => {
        const xForTick = (maxTemperature - temp) * tempScale - 300;  // X position for tick

        // Define the tick as a line on the Y=0 plane
        const tickGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(xForTick, Math.log10(0.0001) * lumScale + 50 - tickLength / 2, 0),  // Start of tick (Y = -tickLength / 2)
            new THREE.Vector3(xForTick, Math.log10(0.0001) * lumScale + 50 + tickLength / 2, 0)    // End of tick (Y = +tickLength / 2)
        ]);
        const tick = new THREE.Line(tickGeometry, tickMaterial);
        scene.add(tick);

        // Add labels using HTML
        add3DTickLabels();
        add3DTextLabel();
        add3DYTicksAndLabels();
        add3DYAxisLabel();
    });
}

// Function to create the X-axis label using HTML elements
// Load the font and create the 3D text for the X-axis label
// Function to create tick labels for the X-axis
function add3DTickLabels() {
    const loader = new THREE.FontLoader();

    // Load the font (same as before)
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const temperatures = [3000, 5000, 7000, 9000, 11000, 13000]; // Tick positions for every 5000 degrees

        // Loop through the temperature ticks and add a label for each
        temperatures.forEach(temp => {
            // Create TextGeometry for each tick label
            const textGeometry = new THREE.TextGeometry(`${temp} K`, {
                font: font,
                size: 8,       // Size of the text
                height: 0.1,      // Depth of the text
                curveSegments: 12, // How smooth the curves of the text should be
            });

            // Create a material for the tick label (black color)
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Create a mesh with the geometry and material
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Calculate X position for the tick label, similar to how we position the ticks
            const xForTick = (maxTemperature - temp) * tempScale - 300;

            // Position the label just below the tick mark
            textMesh.position.set(xForTick, Math.log10(0.0001) * lumScale + 30, 0);  // Adjust position as needed

            // Add the tick label to the scene
            scene.add(textMesh);
        });
    });
}

function add3DTextLabel() {
    const loader = new THREE.FontLoader();

    // Load a font (you need to have a .json font file, like 'helvetiker_regular.typeface.json')
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        // Create TextGeometry with the label
        const textGeometry = new THREE.TextGeometry('Temperature (K)', {
            font: font,
            size: 12,       // Size of the text
            height: 0.1,      // Depth of the text
            curveSegments: 12, // How smooth the curves of the text should be
        });

        // Create material for the text (black color)
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Create a mesh with the geometry and material
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text below the X-axis, centered
        textMesh.position.set(0, Math.log10(0.0001) * lumScale, 0);  // Adjust position as needed

        // Add the text to the scene
        scene.add(textMesh);
    });
}

// Function to create tick marks and labels for the Y-axis
function add3DYTicksAndLabels() {
    const loader = new THREE.FontLoader();

    // Load the font (same as before)
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        // Define luminosity ticks at logarithmic intervals
        const luminosities = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000];

        // Create tick marks for each luminosity value
        const tickMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color for tick marks
        const tickLength = 10; // Length of each tick mark

        luminosities.forEach(luminosity => {
            // Calculate Y position for the tick mark using logarithmic scale
            const yForTick = Math.log10(luminosity) * lumScale + 50;

            // X position for Y-axis (14000 K is mapped to -300 on the X-axis)
            const xForYAxis = (maxTemperature - maxTemperature) * tempScale - 300;

            // Create the tick mark as a line on the Y-axis at 14000K
            const tickGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xForYAxis - tickLength / 2, yForTick, 0),   // Start of tick (left of Y-axis)
                new THREE.Vector3(xForYAxis + tickLength / 2, yForTick, 0)    // End of tick (right of Y-axis)
            ]);
            const tick = new THREE.Line(tickGeometry, tickMaterial);
            scene.add(tick);

            // Add text labels for each luminosity value
            const textGeometry = new THREE.TextGeometry(`${luminosity}`, {
                font: font,
                size: 8,       // Size of the text
                height: 0.1,     // Depth of the text
                curveSegments: 12, // Smoothness of the text curves
            });

            // Create material for the text label (black color)
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

            // Create a mesh with the geometry and material for the text label
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position the label to the left of the Y-axis, at X = -350, aligned with the ticks
            textMesh.position.set(xForYAxis - 40, yForTick - 2, 0);  // Adjust X and Y positions as needed

            // Add the text label to the scene
            scene.add(textMesh);
        });
    });
}

// Function to add the Y-axis label "Luminosity (L⊙)"
function add3DYAxisLabel() {
    const loader = new THREE.FontLoader();

    // Load the font (same as before)
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        // Create the Y-axis label "Luminosity (L⊙)"
        const textGeometry = new THREE.TextGeometry('Luminosity (L_Sun)', {
            font: font,
            size: 12,         // Size of the text
            height: 0.1,       // Depth of the text
            curveSegments: 12, // Smoothness of the curves
        });

        // Create material for the text (black color)
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Create a mesh with the geometry and material
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position and rotate the label to align with the Y-axis
        textMesh.position.set(-380, Math.log10(1) * lumScale + 20, 0);  // Adjust position as needed
        textMesh.rotation.z = Math.PI / 2;  // Rotate 90 degrees to align with the Y-axis

        // Add the text label to the scene
        scene.add(textMesh);
    });
}

// Modify the addAxes function to call addXTicks
function addAxes() {
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black color for axes

    // X-axis (temperature) - Should be placed at y corresponding to luminosity = 0.0001
    const yForXAxis = Math.log10(0.0001) * lumScale + 50;  // Calculate Y position for X-axis at luminosity 0.0001

    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3((maxTemperature - 14000) * tempScale - 300, yForXAxis, 0),   // Start point (14000 K, leftmost)
        new THREE.Vector3((maxTemperature - 2000) * tempScale - 300, yForXAxis, 0)     // End point (2000 K, rightmost)
    ]);
    const xAxis = new THREE.Line(xAxisGeometry, axisMaterial);
    scene.add(xAxis);

    // Y-axis (luminosity) - Drawn at the position where temperature is 14000 K (inverted temperature axis)
    const xForYAxis = (maxTemperature - maxTemperature) * tempScale - 300;  // X position for Y-axis at 14000 K

    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xForYAxis, Math.log10(minLuminosity) * lumScale + 50, 0),   // Start point (min luminosity)
        new THREE.Vector3(xForYAxis, Math.log10(maxLuminosity) * lumScale + 50, 0)    // End point (max luminosity)
    ]);
    const yAxis = new THREE.Line(yAxisGeometry, axisMaterial);
    scene.add(yAxis);

    // Add tick marks for the X-axis
    addXTicks();
}


// Function to load and parse the CSV file
function loadCSV() {
    fetch('assets/stars.csv')  // Update the path if needed to match your folder structure
        .then(response => response.text())
        .then(csvText => {
            // Parse the CSV text using PapaParse
            Papa.parse(csvText, {
                header: true,    // Ensure that the first row is treated as headers
                complete: function(results) {
                    console.log("CSV Data Loaded:", results.data); // Debugging: Log the loaded data
                    // Pass the parsed data to the function that will plot the stars
                    plotStars(results.data);
                },
                error: function(error) {
                    console.error('Error loading CSV:', error);
                }
            });
        });
}

// Function to plot stars on the HR diagram based on CSV data
function plotStars(starData) {
    starData.forEach((starInfo) => {
        // Ensure the required fields (luminosity and temperature) exist and are valid
        if (starInfo.luminosity && starInfo.temperature && !isNaN(starInfo.luminosity) && !isNaN(starInfo.temperature)) {
            const luminosity = parseFloat(starInfo.luminosity);
            const temperature = parseFloat(starInfo.temperature);

            // Ensure the temperature and luminosity are within the allowed range
            if (temperature >= minTemperature && temperature <= maxTemperature && luminosity >= minLuminosity && luminosity <= maxLuminosity) {
                // Debugging: Check the values of temperature and luminosity
                console.log(`Plotting star - Temperature: ${temperature}, Luminosity: ${luminosity}`);
                const starcolour = getStarColor(temperature);
                // Create a small sphere for each star
                const starGeometry = new THREE.SphereGeometry(sizeScale, 16, 16); // Uniformly small size to match matplotlib's s=1
                //const starMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff}); // Blue stars to match matplotlib's blue color
                const starMaterial = new THREE.MeshBasicMaterial({color: starcolour});
                const star = new THREE.Mesh(starGeometry, starMaterial);

                // Linear scale for temperature, with inversion (high temperature on the left)
                star.position.x = (maxTemperature - temperature) * tempScale - 300; // Invert the temperature axis

                // Logarithmic scale for luminosity (Y axis), similar to matplotlib
                star.position.y = Math.log10(luminosity) * lumScale + 50;  // Y axis (logarithmic luminosity)

                // Store the star's data in its userData property for raycasting
                star.userData = {
                    hip: starInfo.hip, // Hipparcos number
                    temperature: temperature,
                    luminosity: luminosity
                };

                // Add the star to the scene and the raycasting array
                scene.add(star);
                stars.push(star); // Add the star to the array for raycasting
            }
        } else {
            // Debugging: If a star is skipped, log the issue
            console.warn('Invalid data for star:', starInfo);
        }
    });
    animate();
}

function getStarColor(temperature) {
    // Define temperature ranges in Kelvin and corresponding RGB colors
    const minTemperature = 2000;   // Coolest stars
    const maxTemperature = 40000;  // Hottest stars

    // Clamp temperature to the min and max range
    temperature = Math.max(minTemperature, Math.min(maxTemperature, temperature));

    // Key temperature points and corresponding colors in RGB
    const colorMap = [
        { temp: 2000, color: { r: 255, g: 50, b: 0 } },      // Deep Red
        { temp: 3000, color: { r: 255, g: 80, b: 0 } },      // More Red
        { temp: 4000, color: { r: 255, g: 140, b: 0 } },     // Orange
        { temp: 5000, color: { r: 255, g: 255, b: 0 } },     // Yellow
        { temp: 6000, color: { r: 255, g: 255, b: 240 } },   // Yellowish White
        { temp: 8000, color: { r: 255, g: 255, b: 255 } },   // White
        { temp: 10000, color: { r: 201, g: 215, b: 255 } },  // Light Blue
        { temp: 12000, color: { r: 100, g: 150, b: 255 } },  // More Blue around 12000K
        { temp: 20000, color: { r: 64, g: 156, b: 255 } },   // Blue
        { temp: 30000, color: { r: 0, g: 80, b: 255 } },     // Deep Blue
        { temp: 40000, color: { r: 0, g: 0, b: 255 } }       // Very Hot Blue
    ];

    // Find the two colors to interpolate between based on temperature
    let lowerColor, upperColor;
    for (let i = 0; i < colorMap.length - 1; i++) {
        if (temperature >= colorMap[i].temp && temperature <= colorMap[i + 1].temp) {
            lowerColor = colorMap[i];
            upperColor = colorMap[i + 1];
            break;
        }
    }

    // Calculate the interpolation factor (between 0 and 1)
    const t = (temperature - lowerColor.temp) / (upperColor.temp - lowerColor.temp);

    // Interpolate the RGB values between the two colors
    const r = Math.round(lowerColor.color.r + t * (upperColor.color.r - lowerColor.color.r));
    const g = Math.round(lowerColor.color.g + t * (upperColor.color.g - lowerColor.color.g));
    const b = Math.round(lowerColor.color.b + t * (upperColor.color.b - lowerColor.color.b));

    // Convert RGB to hexadecimal format
    const color = (r << 16) | (g << 8) | b;
    return color;
}

// Camera positioning
camera.position.z = 400;  // Move the camera back so the entire HR diagram is visible

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Add axes and load stars
addAxes();
loadCSV();
