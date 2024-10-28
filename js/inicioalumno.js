document.addEventListener('DOMContentLoaded', () => {
    const frases = [
        "El único lugar donde el éxito viene antes que el trabajo es en el diccionario.",
        "La educación es el primer paso hacia el cambio que quieres ver en el mundo.",
        "Cada error es una lección. No temas equivocarte, ¡aprende de ello!",
        "El esfuerzo de hoy será tu éxito de mañana.",
        "No importa lo lento que vayas, siempre y cuando no te detengas.",
        "La clave para el éxito es la constancia en los estudios.",
        "El conocimiento es poder; no te conformes, aprende más cada día.",
        "La educación es la puerta que abre oportunidades.",
        "La disciplina es el puente entre metas y logros.",
        "Lo único imposible es aquello que no intentas.",
        "Cree en ti mismo. Eres capaz de lograr cosas increíbles.",
        "Tu único límite es tu mente. Piensa en grande y esfuérzate.",
        "Estudia no para saber más, sino para ser mejor cada día.",
        "El éxito no llega por casualidad, llega por esfuerzo y dedicación.",
        "Recuerda que todo esfuerzo tendrá su recompensa."
    ];

    // Selección de una frase aleatoria
    function mostrarFraseAleatoria() {
        const frase = frases[Math.floor(Math.random() * frases.length)];
        document.getElementById('frase-motivacional').innerText = frase;
    }

    // Cambia la frase cada 5 segundos
    setInterval(mostrarFraseAleatoria, 5000);

    // Mostrar una frase inicialmente
    mostrarFraseAleatoria();
});
