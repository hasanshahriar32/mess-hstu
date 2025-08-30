import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Insert sample users
  const users = await Promise.all([
    prisma.users.create({
      data: {
        name: 'Md. Rahman',
        email: 'rahman@example.com',
        mobile: '01711111111',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        role: 'owner',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        name: 'Fatema Khatun',
        email: 'fatema@example.com',
        mobile: '01722222222',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        role: 'owner',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        name: 'Karim Ahmed',
        email: 'karim@example.com',
        mobile: '01733333333',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        role: 'owner',
        is_active: true,
      },
    }),
    prisma.users.create({
      data: {
        name: 'Nasir Uddin',
        email: 'nasir@example.com',
        mobile: '01744444444',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        role: 'owner',
        is_active: true,
      },
    }),
  ])

  console.log('users created:', users.length)

  // Insert sample mess groups
  const messGroups = await Promise.all([
    prisma.mess_groups.create({
      data: {
        name: 'Kornai Boys Mess 1',
        description: 'Clean and affordable mess for boys with home-cooked meals',
        location: 'kornai-boys',
        category: 'boys',
        price_per_month: 3500.00,
        capacity: 20,
        available_seats: 5,
        contact_phone: '01711111111',
        contact_email: 'rahman@example.com',
        address: 'House #12, Road #3, Kornai, Dinajpur',
        amenities: ['WiFi', 'AC', 'Laundry', '24/7 Water'],
        images: ['/images/boys-mess-building.png', '/images/mess-inner-view.jpg', '/images/kitchen.jpg'],
        owner_id: users[0].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'Kornai Boys Mess 2',
        description: 'Premium mess facility with modern amenities',
        location: 'kornai-boys',
        category: 'boys',
        price_per_month: 4200.00,
        capacity: 15,
        available_seats: 3,
        contact_phone: '01722222222',
        contact_email: 'fatema@example.com',
        address: 'House #25, Road #5, Kornai, Dinajpur',
        amenities: ['WiFi', 'AC', 'Gym', 'Study Room', '24/7 Security'],
        images: ['/images/boys-mess-building.png', '/images/mess-inner-view.jpg'],
        owner_id: users[1].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'Mohabolipur Girls Mess 1',
        description: 'Safe and secure mess for girls with nutritious meals',
        location: 'mohabolipur-girls',
        category: 'girls',
        price_per_month: 3800.00,
        capacity: 18,
        available_seats: 7,
        contact_phone: '01733333333',
        contact_email: 'karim@example.com',
        address: 'House #8, Road #2, Mohabolipur, Dinajpur',
        amenities: ['WiFi', 'Security Guard', 'CCTV', 'Common Room'],
        images: ['/images/girls-mess-building.png', '/images/mess-inner-view.jpg', '/images/washroom.jpg'],
        owner_id: users[2].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'Mohabolipur Girls Mess 2',
        description: 'Comfortable living with all modern facilities',
        location: 'mohabolipur-girls',
        category: 'girls',
        price_per_month: 4000.00,
        capacity: 12,
        available_seats: 2,
        contact_phone: '01744444444',
        contact_email: 'nasir@example.com',
        address: 'House #15, Road #4, Mohabolipur, Dinajpur',
        amenities: ['WiFi', 'AC', 'Study Room', '24/7 Security', 'Backup Generator'],
        images: ['/images/girls-mess-building.png', '/images/kitchen.jpg'],
        owner_id: users[3].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'BCS Gali Boys Mess 1',
        description: 'Budget-friendly mess near HSTU campus',
        location: 'bcs-gali-boys',
        category: 'boys',
        price_per_month: 3200.00,
        capacity: 25,
        available_seats: 8,
        contact_phone: '01711111111',
        contact_email: 'rahman@example.com',
        address: 'House #5, BCS Gali, Dinajpur',
        amenities: ['WiFi', 'Common TV', 'Study Area'],
        images: ['/images/boys-mess-building.png', '/images/mess-inner-view.jpg'],
        owner_id: users[0].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'BCS Gali Boys Mess 2',
        description: 'Well-maintained mess with quality food',
        location: 'bcs-gali-boys',
        category: 'boys',
        price_per_month: 3600.00,
        capacity: 20,
        available_seats: 6,
        contact_phone: '01722222222',
        contact_email: 'fatema@example.com',
        address: 'House #18, BCS Gali, Dinajpur',
        amenities: ['WiFi', 'Laundry', '24/7 Water', 'Parking'],
        images: ['/images/boys-mess-building.png', '/images/kitchen.jpg', '/images/washroom.jpg'],
        owner_id: users[1].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'Priom Building Girls Mess',
        description: 'Premium accommodation in Priom Building',
        location: 'priom-building-girls',
        category: 'girls',
        price_per_month: 4500.00,
        capacity: 10,
        available_seats: 1,
        contact_phone: '01733333333',
        contact_email: 'karim@example.com',
        address: 'Priom Building, 3rd Floor, Dinajpur',
        amenities: ['Elevator', 'WiFi', 'AC', '24/7 Security', 'Backup Power'],
        images: ['/images/priom-building.jpg', '/images/mess-inner-view.jpg'],
        owner_id: users[2].id,
        is_active: true,
      },
    }),
    prisma.mess_groups.create({
      data: {
        name: 'Priom Building Boys Mess',
        description: 'Modern mess facility in Priom Building',
        location: 'priom-building-boys',
        category: 'boys',
        price_per_month: 4300.00,
        capacity: 12,
        available_seats: 4,
        contact_phone: '01744444444',
        contact_email: 'nasir@example.com',
        address: 'Priom Building, 2nd Floor, Dinajpur',
        amenities: ['Elevator', 'WiFi', 'Study Room', 'Common Area'],
        images: ['/images/priom-building.jpg', '/images/kitchen.jpg'],
        owner_id: users[3].id,
        is_active: true,
      },
    }),
  ])

  console.log('Mess groups created:', messGroups.length)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })