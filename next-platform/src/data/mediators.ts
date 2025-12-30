export const MEDIATORS_REGISTRY: Record<string, any> = {
    'Lílian Gusmão': {
        name: 'Lílian V. N. Gusmão Vianei',
        image: '/assets/lilian-vanessa.jpeg',
        bio: `Mulher, mineira, migrante, mãe atípica e feminista. Atuo como psicóloga, Gestalt-terapeuta, idealizadora, sócia fundadora e curadora do Instituto de Gestalt-terapia de Rondônia – Figura Viva com ênfase em estudos, vivências a partir de temas feministas, antirracistas, anticapacitistas e decoloniais, que des-cobrem e in-ventam uma presença sensível no campo/organismo/ambiente.

        Formação e Pós-formação em Gestalt-terapia, Trauma, Psicoterapia corporal, Neurodiversidades. Escreve com interesse em temas como o lugar da mulher na Gestalt-terapia a partir de Laura Perls, opressões de gênero, violências, solidariedade política entre mulheres brancas e multiétnicas. Mestra em Ciências Ambientais pela UNITAU e graduada em psicologia pela UFMG.`
    },
    'Wanne Belmino': {
        name: 'Wanne Belmino',
        image: null,
        bio: 'Informações sobre Wanne Belmino em breve.'
    },
    'Sâmara Bernardo': {
        name: 'Sâmara Bernardo',
        image: null,
        bio: 'Informações sobre Sâmara Bernardo em breve.'
    }
};

export const getMediatorDetails = (nameOrObject: any) => {
    let name = '';
    let objectData: any = {};

    if (typeof nameOrObject === 'string') {
        name = nameOrObject;
    } else if (typeof nameOrObject === 'object' && nameOrObject !== null) {
        name = nameOrObject.name || '';
        objectData = nameOrObject;
    }

    const registryMatch = MEDIATORS_REGISTRY[name] ||
        MEDIATORS_REGISTRY[Object.keys(MEDIATORS_REGISTRY).find(k => k.includes(name) || name.includes(k)) || ''];

    if (registryMatch) {
        return {
            name: objectData.name || registryMatch.name,
            image: objectData.image || registryMatch.image,
            bio: (objectData.bio && objectData.bio.trim().length > 0) ? objectData.bio : registryMatch.bio
        };
    }

    return {
        name: name,
        image: objectData.image || null,
        bio: objectData.bio || 'Biografia não disponível no momento.'
    };
};
