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
    // 1. Resolve Name
    let name = '';
    let objectData = {};

    if (typeof nameOrObject === 'string') {
        name = nameOrObject;
    } else if (typeof nameOrObject === 'object' && nameOrObject !== null) {
        name = nameOrObject.name || '';
        objectData = nameOrObject;
    }

    // 2. Find Registry Match (Exact or Partial)
    // We normalize mainly to handle "Lilian" vs "Lílian" potentially, but for now simple check
    const registryMatch = MEDIATORS_REGISTRY[name] ||
        MEDIATORS_REGISTRY[Object.keys(MEDIATORS_REGISTRY).find(k => k.includes(name) || name.includes(k))];

    // 3. Merge Logic: Object overrides Registry, but Registry fills gaps
    if (registryMatch) {
        return {
            name: objectData.name || registryMatch.name,
            image: objectData.image || registryMatch.image,
            bio: (objectData.bio && objectData.bio.trim().length > 0) ? objectData.bio : registryMatch.bio
        };
    }

    // 4. No Registry Match -> Return Object Data or Fallback
    return {
        name: name,
        image: objectData.image || null,
        bio: objectData.bio || 'Biografia não disponível no momento.'
    };
};
