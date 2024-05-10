// const { exec } = require("child_process");
// const fs = require("fs-extra");
// const path = require("path");


const footer = document.querySelector('footer');
footer.innerHTML = 'Mark Battistella &copy; 2013-' + new Date().getFullYear();

let isInside = false;

const bodyElement = document.querySelector('body');
const pendingElement = document.querySelector('div.state.pending');
const pendingHeaderElement = pendingElement.querySelector('h1');

const processingElement = document.querySelector('div.state.processing');


document.addEventListener('dragenter', event => {
    if (!isInside) {

        bodyElement.classList = '';
        bodyElement.classList.add('onHover');
        pendingHeaderElement.textContent = 'Release to process this file';
        isInside = true;
    }
    event.preventDefault();
});

document.addEventListener('dragleave', event => {
    if (isInside) {
        bodyElement.classList = '';
        pendingHeaderElement.textContent = 'Drop your Jury Book archive ZIP file here';
        isInside = false;
    }
    event.preventDefault();
});

document.addEventListener('dragover', event => {
    event.preventDefault();
});


document.addEventListener('drop', async (event) => {
    event.preventDefault();
    if (event.dataTransfer.items) {
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                var file = event.dataTransfer.items[i].getAsFile();
                if (file.name.toLowerCase().endsWith('.zip')) {

                    const filePath = file.path;
                    const result = await window.electronAPI.processZipFile(filePath);

                    if (result.success) {
                        console.log('ZIP file processed:', result.log);
                    } else {
                        console.error('Error processing ZIP file:', result.error, result.log);
                    }



                    if (!window.isProcessing) {

                        bodyElement.classList = '';
                        bodyElement.classList.add('onProcess');

                        pendingElement.classList.add('hidden');
                        pendingElement.classList.remove('visible');

                        processingElement.classList.add('visible');
                        processingElement.classList.remove('hidden');

                        processZipFile(file);

                    }
                } else {

                    bodyElement.classList = '';
                    bodyElement.classList.add('onError');
                    pendingHeaderElement.innerHTML = 'This app only accepts<br>ZIP archive files';

                    setTimeout(() => {
                        bodyElement.classList = '';
                        pendingHeaderElement.textContent = 'Drop your Jury Book archive ZIP file here';
                    }, 4000);
                
                }
            }
        }
    }
});


window.isProcessing = false;

function processZipFile(file) {
    window.isProcessing = true;

    const phase1 = document.getElementById('process-item-1');
    const phase2 = document.getElementById('process-item-2');
    const phase3 = document.getElementById('process-item-3');
    const phase4 = document.getElementById('process-item-4');
    const phase5 = document.getElementById('process-item-5');
    const phase6 = document.getElementById('process-item-6');
    const phase7 = document.getElementById('process-item-7');

    const progress = document.getElementById('total-progress');


    // Phase 1
    phase1.classList.add('active');
    setTimeout(() => { progress.style.width = '10%'}, 300);


    console.log(file)



    // Phase 2
    setTimeout(() => {
        phase1.classList.add('completed');
        phase1.classList.remove('active');

        phase2.classList.add('active');
        progress.style.width = '20%';
    }, 4000);

    // Phase 3
    setTimeout(() => {
        phase2.classList.add('completed');
        phase2.classList.remove('active');

        phase3.classList.add('active');
        progress.style.width = '30%';
    }, 8000);

    // Phase 4
    setTimeout(() => {
        phase3.classList.add('completed');
        phase3.classList.remove('active');

        phase4.classList.add('active');
        progress.style.width = '35%';
    }, 16000);

    // Phase 5
    setTimeout(() => {
        phase4.classList.add('completed');
        phase4.classList.remove('active');

        phase5.classList.add('active');
        progress.style.width = '70%';
    }, 20000);

    // Phase 6
    setTimeout(() => {
        phase5.classList.add('completed');
        phase5.classList.remove('active');
    
        phase6.classList.add('active');
        progress.style.width = '80%';
    }, 24000);

    // Phase 7
    setTimeout(() => {
        phase6.classList.add('completed');
        phase6.classList.remove('active');

        phase7.classList.add('active');
        progress.style.width = '100%';

        // Open directory
    }, 28000);


    // Reset view
    setTimeout(() => {
        bodyElement.classList = '';
        pendingElement.classList.add('visible');
        pendingElement.classList.remove('hidden');

        processingElement.classList.add('hidden');
        processingElement.classList.remove('visible');
    }, 32000);

}
