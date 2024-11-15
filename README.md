# Test Linking

## reproduction

```
npx create-expo-app@latest StickerSmash
npx expo prebuild
```

## dev

```
npm install

npx expo start -c

```

## test

```
npx uri-scheme open myapp://home --ios
npx uri-scheme open myapp://explore --ios
npx uri-scheme open myapp://notfound --ios
```
