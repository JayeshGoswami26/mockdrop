import animals from '../data/animals.js';

export function createAnimalGenerator(prng) {
  return {
    bear() { return prng.pick(animals.bear); },
    bird() { return prng.pick(animals.bird); },
    cat() { return prng.pick(animals.cat); },
    cetacean() { return prng.pick(animals.cetacean); },
    cow() { return prng.pick(animals.cow); },
    crocodilia() { return prng.pick(animals.crocodilia); },
    dog() { return prng.pick(animals.dog); },
    fish() { return prng.pick(animals.fish); },
    horse() { return prng.pick(animals.horse); },
    insect() { return prng.pick(animals.insect); },
    lion() { return prng.pick(animals.lion); },
    petName() { return prng.pick(animals.petNames); },
    rabbit() { return prng.pick(animals.rabbit); },
    rodent() { return prng.pick(animals.rodent); },
    snake() { return prng.pick(animals.snake); },
    /** General biological category, e.g. "Mammal", "Reptile". */
    type() { return prng.pick(animals.types); },
  };
}
