import argon2 from 'argon2';

export const hashAsync = async (text: string) => {
  try {
    const hash = await argon2.hash(text, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 5, // 5 iterations
      parallelism: 1, // 1 thread (node is single threaded)
    });

    return hash;
  } catch (err) {
    throw new Error('API Key hashing failed');
  }
};

export const verifyAsync = async (hash: string, text: string) => {
  return await argon2.verify(hash, text);
};
