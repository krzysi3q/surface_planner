import { twMerge, ClassNameValue } from 'tailwind-merge'

export const classMerge = (...classes: ClassNameValue[]) => twMerge(...classes)