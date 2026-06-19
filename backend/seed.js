const connectDatabase = require('./config/database');
const Clan = require('./models/Clan');
const User = require('./models/User');

async function seed() {
    try {
        await connectDatabase();
        await Promise.all([
            Clan.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('Database cleared');

        // Create a default clan
        await Clan.create({
            name: 'Os Bárbaros',
            tag: '#L98JQV',
            medals: 18450,
            members: [
                { name: 'KingSlayer', tag: '#123', role: 'Leader', decksUsed: 4, lastActive: new Date() },
                { name: 'ArcherQueen', tag: '#456', role: 'Co-Leader', decksUsed: 4, lastActive: new Date() }
            ]
        });
        console.log('Default clan created');

        // Create a default user
        await User.create({
            email: 'lider@clashclan.com',
            password: '123', // In a real app, use bcrypt
            clanTag: '#L98JQV',
            role: 'leader'
        });
        console.log('Default user created');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
