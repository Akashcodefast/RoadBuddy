const EmergencyContacts = () => {
  const contacts = [
    { name: "Police",        number: "100",   emoji: "🚔", color: "blue"   },
    { name: "Ambulance",     number: "102",   emoji: "🚑", color: "red"    },
    { name: "Fire",          number: "101",   emoji: "🚒", color: "orange" },
    { name: "Roadside Help", number: "1800", emoji: "🛣️", color: "yellow" },
  ];

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6">
      
      {/* header */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 lg:mb-3">🆘</div>
        <div className="font-bold text-xs sm:text-sm lg:text-base">Emergency Contacts</div>
        <div className="text-red-400 text-xs hidden sm:block lg:text-sm mt-1">Quick call buttons</div>
      </div>

      {/* contacts grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {contacts.map((contact) => (
          <a
            key={contact.number}
            href={`tel:${contact.number}`}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 rounded-lg p-2 sm:p-3 transition text-center"
          >
            <div className="text-2xl sm:text-3xl mb-1">{contact.emoji}</div>
            <div className="font-semibold text-xs sm:text-sm">{contact.name}</div>
            <div className="text-red-400 font-bold text-xs sm:text-sm mt-0.5">📞 {contact.number}</div>
          </a>
        ))}
      </div>

    </div>
  );
};

export default EmergencyContacts;