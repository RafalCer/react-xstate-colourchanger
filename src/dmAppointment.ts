import { MachineConfig, send, Action, assign } from "xstate";


function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}


const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://rafalappointment.herokuapp.com/model/parse'
const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json()); 

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
    "John": { person: "John Appleseed" },
    "Jack": { person: "Jack Jackson" },
    "Liana": { person: "Liana Jelena" },
    "Natalie": { person: "Natalie Portman" },
    "Bruce": { person: "Bruce W" },
    "Bob": { person: "Bob the builder" },
    "Shrek": { person: "Shrek" },

    "on Monday": {day: "Monday" },
    "Monday": {day: "Monday" },
    "on Tuesday": {day: "Tuesday" },
    "Tuesday": {day: "Tuesday" },
    "on Wednesday": {day: "Wednesday" },
    "Wednesday": {day: "Wednesday" },
    "on Thursday": {day: "Thursday" },
    "Thursday": {day: "Thursday" },
    "on Friday": {day: "Friday" },
    "Friday": {day: "Friday" },
    "on Satudary": {day: "Satuday" },
    "Satudary": {day: "Satuday" },
    "on Sunday": {day: "Sunday" },
    "Sunday": {day: "Sunday" },

    "10": { time: "10:00" },
    "11": { time: "11:00" },
    "12": { time: "12:00" },
    "13": { time: "13:00" },
    "14": { time: "14:00" },
    "15": { time: "15:00" },
    "16": { time: "16:00" },
    "17": { time: "17:00" },
    "18": { time: "18:00" },
    "19": { time: "19:00" },

}

const boolean_grammar: {[index: string]: {agreement?: boolean, disagreement?: boolean, uncertain?: string}} = {
    "yes": {agreement: Boolean(true)},
    "of course": {agreement: Boolean(true)},
    "sure": {agreement: Boolean(true)},
    "absolutely": {agreement: Boolean(true)},
    "yes please": {agreement: Boolean(true)},
    "no": {disagreement: Boolean(false)},
    "no way": {disagreement: Boolean(false)},
    "absolutely not": {disagreement: Boolean(false)},
    "never": {disagreement: Boolean(false)},
    "maybe": {uncertain: "unsure"},
    "perhaps": {uncertain: "unsure"},
    "I don't know": {uncertain: "unsure"},
    "probably": {uncertain: "unsure"},
}

/*const type_grammar: {[index: string]: {task?: string}} = {
    "appointment": {task: "appointment"},
    "shcedule an appointment": {task: "appointment"},
    "shcedule appointment": {task: "appointment"},
    "make an appointment": {task: "appointment"},
    "make appointment": {task: "appointment"},


    "timer": {task: "timer"},
    "set a timer": {task: "timer"},
    "set timer": {task: "timer"},

    "to do item": {task: "to do item"},
    "todo item": {task: "to do item"},
    "item": {task: "to do item"},*/

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    
    initial: 'start_point',
    states: {
        start_point:{
            on: {
                CLICK: 'choice_of_tool'
            }
        },
        choice_of_tool:{
            id: 'make_a_choice',
            initial: "prompt",
            on: {
                RECOGNISED:[{
                    actions: assign((context) => { return { task: context.recResult } }),
                    target: 'choice'},
                
                {target: ".nomatch"}]
            },
            states:{
                prompt: { entry: say("What would you like to do?"),
                        on: {ENDSPEECH: 'ask'}
                },
                ask: {
                    entry: listen()
                },
                nomatch: { entry: say("Sorry, I didn't quite get you. Could you please repeat?"),
                on: {ENDSPEECH: 'ask'}}
            }
        },
        choice:{
            invoke: {
                id: 'rasaApi',
                src: (context, event) =>  nluRequest(context.task),
                onDone:{
                    target: 'tool',
                    actions:[
                        assign((context, event) => { return { intentResult: event.data.intent.name} }),
                        (context:SDSContext, event:any) => console.log(event.data)]
                },
                onError:{
                    target: 'choice_of_tool',
                    actions: (context, event) => console.log(event.data)

                }

            }

        },
        tool:{
            initial: 'prompt',
            on:{
                ENDSPEECH:[{
                    cond: (context) => context.intentResult === 'todo_item',
                    target: 'todo_item'},
                    {cond: (context) => context.intentResult === 'appointment',
                    target: 'appointment'},
                    {cond: (context) => context.intentResult === 'timer',
                    target: 'timer'},
                {target:'.nomatch'}]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Let us proceed to ${context.task} then`}))},
                nomatch: {
                    entry: say("Excuse me, I don't yet know such task"),
                    on: {ENDSPEECH: '#make_a_choice'}
                        
                    }
                        
                }

        },
        timer: {
            initial: 'prompt',
            on: {ENDSPEECH: 'choice_of_tool'},
            states:{
                prompt:{
                    entry: say("Welcome to the timer tool!")
                }
            }
        },
        todo_item: {
            initial: 'prompt',
            on: {ENDSPEECH: 'choice_of_tool'},
            states:{
                prompt:{
                    entry: say("Welcome to the to do item tool!")
                }
            }
        },
        appointment:{
            initial: 'prompt',
            on:{ ENDSPEECH: 'who'
            },
            states:{
                prompt:{
                    entry: say("Welcome to the appointment tool! Let's create an appointment.")
                }
            }
        },
            who: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "person" in (grammar[context.recResult] || {}),
                        actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                        target: "day"

                    },
                    { target: ".nomatch" }]
                },
                states: {
                    prompt: {
                        entry: say("Who are you meeting with?"),
                        on: { ENDSPEECH: "ask" }
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry I don't know them"),
                        on: { ENDSPEECH: "prompt" }
                    }
                }
            },
            day: {
                initial: "prompt",
                on: {
                    RECOGNISED: [{
                        cond: (context) => "day" in (grammar[context.recResult] || {}),
                        actions: assign((context) => {return{ day: grammar[context.recResult].day}}),
                        target: "length"
                    },
                    {target: ".nomatch"}]
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: `OK. ${context.person}. On which day is your meeting?`})),
                        on: {ENDSPEECH: "ask"}
                        },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}
                    }
                }
            },
            length: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "whole_day"},

                        {cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: "time"},

                        {cond: (context) => "uncertain in" in (boolean_grammar[context.recResult] || {}),
                        target: ".more_specific"},

                    {target:".nomatch"}]

                    },
                states: {
                    prompt: {
                        entry: say("Will it take the whole day?"),
                        on: {ENDSPEECH: "ask"}
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Please be more specific."),
                    on: {ENDSPEECH: "ask"}
                    },
                    more_specific: {
                        entry: say("please be more specific."),
                    on: {ENDSPEECH: "ask"},
                    }
                }
            },
            time: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "time" in (grammar[context.recResult] || {}),
                        actions: assign((context) => {return{ time: grammar[context.recResult].time}}),
                        target: "repetition"
                        },
                    {
                    target: ".nomatch"
                    }]
                },
                states: {
                    prompt: {
                        entry: say("What time is your meeting?"),
                        on: {ENDSPEECH: "ask"}
                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}
                    }
            },
            whole_day: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: "who"},

                    {target: ".nomatch"}]
                },
                states:{
                    prompt:{
                        entry: send((context) => ({
                            type: "SPEAK",
                            value:`Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`})),
                        on: {ENDSPEECH: "ask"}

                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}
                }
            },
            repetition: {
                initial: "prompt" ,
                on: {
                    RECOGNISED: [{
                        cond: (context) => "agreement" in (boolean_grammar[context.recResult] || {}),
                        target: "confirmation"},
                        {
                        cond: (context) => "disagreement" in (boolean_grammar[context.recResult] || {}),
                        target: "who"},

                    {target: ".nomatch"}]
                },
                states:{
                    prompt:{
                        entry: send((context) => ({
                            type: "SPEAK",
                            value:`Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time}?`})),
                            on: {ENDSPEECH: "ask"}

                    },
                    ask: {
                        entry: listen()
                    },
                    nomatch: {
                        entry: say("Sorry, I don't understand. Please repeat"),
                        on: {ENDSPEECH: "ask"}}
                }
            },
            confirmation: {
                initial: "prompt" ,
                on: {
                    ENDSPEECH: "who"
                },
                states: {
                    prompt: {
                        entry: say("Your appointment has been created!")
                    }
                }

            }
        }
})