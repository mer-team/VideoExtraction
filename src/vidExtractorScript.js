const fs = require('fs')
const ytdl = require('ytdl-core')
var amqp = require('amqplib/callback_api');

/** 
 * Verifica se o URL fornecido está num formato válido aceite pelo Youtube 
 * @param {string} url URL fornecido
 * @returns {boolean}
*/
validURL = async (url) => {
    return ytdl.validateURL(url);
}

/**
 * Extrai o vídeo correspondente ao URL fornecido
 * @param {string} url URL fornecido
 * @returns {boolean} Resultado da extração, se foi ou não extraído
 */
extractVideo = async (url) => {
    var vID = await ytdl.getURLVideoID(url);
    var path = './audios/'+vID+'.wav'
    /*var audio = ytdl(url);
    audio.pipe(fs.createWriteStream(path));
    //https://github.com/MAMISHO/node-ytdl-core/commit/3e3b21215e6d02d729e9849f203e126e0b925efb
    audio.on('response', function(res) {
        var totalSize = res.headers['content-length']
        var dataRead = 0;
        res.on('data', function(data){
            dataRead += data.length;
            var percent = dataRead / totalSize;
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write((percent * 100).toFixed(2) + '% ');
        })
        res.on('end', function() {
            process.stdout.write('Completed\n');
          });
    })*/
}


/**
 * Inicializa todos os métodos necessários para a validação, extração e conversão de um vídeo para versão áudio
 */
startScript = async () => {
    amqp.connect('amqp://test:test@192.168.1.68', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'videoExtraction';

        ch.assertQueue(q, {durable: false});
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, async function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
        var url = msg.content.toString();
        var vURL = await validURL(url).then(u => u)
        if(vURL){
            await extractVideo(url).then();
        }
        }, {noAck: false});
    });
    });
}

/**
 * Executa o método startScript
 */
startScript();