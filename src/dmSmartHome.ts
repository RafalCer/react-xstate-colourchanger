import { MachineConfig, send, Action, assign } from "xstate";
import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/houseGrammar'
const gramm = loadGrammar(grammar)

const UsersCommand = (recResult: string) => {
let prs = parse(recResult.split(/\s+/), gramm);
const result = prs.resultsForRule(gramm.$root)[0];     
return result}

import { say } from './dmAppointment'
import { listen } from './dmAppointment'

/*NB:
Opnly works with the commands that are in the SRGS grammar.
E.g. Open/close (the) window/door;
Turn on/off (the) A C/heating/light. */

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {CLICK: 'welcome'}
        },
        welcome: 
        {
            id: 'welcome_state',
            initial: "prompt",
            on:{
                RECOGNISED:[{
                    actions: assign((context) => { return { HouseCommand: UsersCommand(context.recResult) }}),
                    target: 'action'},

                {target: ".nomatch"}]
            },
            states: {
                prompt: {
                    entry: say('What would you like me to do?'),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say('Sorry, I did not quite get you. Please repeat.'),
                    on: { ENDSPEECH: "ask"}
                }
            }
        },
        action: {
            initial: "prompt",
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Understood! I will now ${context.HouseCommand.action} the ${context.HouseCommand.object}.`})),
                    on: {ENDSPEECH: "#welcome_state"}
                }
            }
        }
    }
})