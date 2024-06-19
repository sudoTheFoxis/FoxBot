module.exports = {
    status: "ON", // ON/OFF (0/1), włącz lub wyłącz daną komende bez robienia bałaganu w kodzie lub plikach
    name: "", // nazwa komendy
    description: "", // opis komendy, co ona robi
    perms: [""], // wymagane uprawnienia do uruchomienia komendy
    help: "", // instrukcja obsługi komendy
    options: [
        // parametry
    ], 
    async run(client, interaction) {
        // kod
    }
}