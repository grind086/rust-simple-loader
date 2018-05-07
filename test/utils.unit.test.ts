/// <reference types="jest" />

import { reverseString } from '../src/utils';

describe('reverseString', () => {
    it('should reverse a string', () => {
        expect(reverseString('the quick brown fox jumped over the lazy dog')).toBe(
            'god yzal eht revo depmuj xof nworb kciuq eht'
        );
    });
});
