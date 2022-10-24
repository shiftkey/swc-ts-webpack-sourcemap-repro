
import { StrictMode } from 'react'
import {render} from 'react-dom'
import { App } from './app'

const appContainer = document.getElementById('project-root')

render(<StrictMode><App /></StrictMode>, appContainer)