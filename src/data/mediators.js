export const MEDIATORS_REGISTRY = {
    'Lílian Gusmão': {
        name: 'Lílian V. N. Gusmão Vianei',
        image: '/assets/lilian-vanessa.jpeg',
        bio: `Mulher, mineira, migrante, mãe atípica e feminista. Atuo como psicóloga, Gestalt-terapeuta, idealizadora, sócia fundadora e curadora do Instituto de Gestalt-terapia de Rondônia – Figura Viva com ênfase em estudos, vivências a partir de temas feministas, antirracistas, anticapacitistas e decoloniais, que des-cobrem e in-ventam uma presença sensível no campo/organismo/ambiente.

        Formação e Pós-formação em Gestalt-terapia, Trauma, Psicoterapia corporal, Neurodiversidades. Escreve com interesse em temas como o lugar da mulher na Gestalt-terapia a partir de Laura Perls, opressões de gênero, violências, solidariedade política entre mulheres brancas e multiétnicas. Mestra em Ciências Ambientais pela UNITAU e graduada em psicologia pela UFMG.`
    },
    'Wanne Belmino': {
        name: 'Wanne Belmino',
        image: null, // Placeholder or need to find an asset
        bio: 'Informações sobre Wanne Belmino em breve.'
    },
    'Sâmara Bernardo': {
        name: 'Sâmara Bernardo',
        image: null,
        bio: 'Informações sobre Sâmara Bernardo em breve.'
    }
};

export const getMediatorDetails = (nameOrObject) => {
    // If it's already an object with full details, return it
    if (typeof nameOrObject === 'object' && nameOrObject !== null) {
        return {
            name: nameOrObject.name || '',
            image: nameOrObject.image || null,
            bio: nameOrObject.bio || ''
        };
    }

    // If it's a string, look up in registry
    if (typeof nameOrObject === 'string') {
        const found = MEDIATORS_REGISTRY[nameOrObject] || MEDIATORS_REGISTRY[Object.keys(MEDIATORS_REGISTRY).find(k => k.includes(nameOrObject))];

        if (found) return found;

        // Fallback if not found in registry
        return {
            name: nameOrObject,
            image: null,
            bio: 'Biografia não disponível no momento.'
        };
    }

    return null;
};
