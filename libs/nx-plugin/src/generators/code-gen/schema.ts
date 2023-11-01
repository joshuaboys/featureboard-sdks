import type { Template } from '@featureboard/code-generator'

export interface CodeGenGeneratorSchema {
    template: Template
    projectName: string
    featureBoardProjectName: string
    featureBoardKey: string
    subFolder: string
}
