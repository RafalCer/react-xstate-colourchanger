export const grammar =  `
<grammar root="request">
    <rule id="request">
        <item repeat="0-1">please</item> 
        <ruleref uri="#proposition"/>
        <tag>
        out.object = rules.proposition.object;
        out.action = rules.proposition.action </tag>
    </rule>    
    
    <rule id="turn_on_off">
        <one-of>
            <item> turn on</item>
            <item> on <tag> out = 'turn on'; </tag></item>
            <item> turn off</item>
            <item> off <tag> out = 'turn off'; </tag></item>
        </one-of>
    </rule>
    <rule id="on_off">
        <one-of>
            <item> on <tag> out = 'turn on'; </tag> </item>
            <item> off <tag> out = 'turn off'; </tag></item>
        </one-of>
    </rule>
    <rule id="open_close">
        <one-of>
            <item>open</item>
            <item>close</item>
        </one-of>
    </rule>

    <rule id="object_abstract"> 
        <one-of> 
            <item> light </item>
            <item> heat </item>
            <item> A C <tag> out = 'air conditioning'; </tag></item>
            <item> air conditioning </item> 
        </one-of> 
    </rule>
    <rule id="object_concrete"> 
        <one-of> 
            <item> window </item>
            <item> door </item> 
        </one-of>
    </rule>

    <rule id ="proposition">
        <one-of>
            /* open/close (the) door/window */
            <item>
                <ruleref uri="#open_close"/>
                <item repeat="0-1">the</item>
                <ruleref uri="#object_concrete"/>
                <tag> out.action = rules.open_close; 
                out.object = rules.object_concrete </tag>
            </item>
            /*turn on/off (the) [abstract noun]*/
            <item>
                <ruleref uri="#turn_on_off"/>
                <item repeat="0-1">the</item>
                <ruleref uri="#object_abstract"/>
                <tag> out.action = rules.turn_on_off;
                out.object = rules.object_abstract </tag>
            </item>
            /* turn (the) [abstract noun] on/off*/
            <item>
                turn <item repeat="0-1">the</item>
                <ruleref uri="#object_abstract"/>
                <ruleref uri="#on_off"/>
                <tag> out.action = rules.on_off;
                out.object = rules.object_abstract</tag>
            </item>
        </one-of>
    </rule>
</grammar>
`