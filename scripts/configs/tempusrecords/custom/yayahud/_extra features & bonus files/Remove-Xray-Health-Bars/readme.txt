Drop hudlayout.res in yayahud/scripts

Note that this file only removes the HP bars you see while in dead/spectator mode; xray vision on teammates will stay.
If you want to disable both of them, just type "tf_spec_xray_disable 1" in the ingame console.

If you ever decide to revert this change, drop the following lines of code to the bottom of hudlayout.res before the bracket.

HudSpectatorExtras
	{
		"fieldName" "HudSpectatorExtras"
		"visible" "1"
		"enabled" "1"
		"xpos"	"0"
		"ypos"	"0"
		"wide"	"f0"
		"tall"	"f0"
	}
