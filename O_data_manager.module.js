import { s_directory_separator } from "./constants.module.js";
import {
    ensureDir,
    ensureFile,
  } from "https://deno.land/std@0.77.0/fs/mod.ts";

class O_data_manager_json_file{
    constructor(o_class){

        this.s_file_name = import.meta.url.split(s_directory_separator).pop()
        this.s_path_name = `.${s_directory_separator}.${this.s_file_name.split(".").shift()}`
        this.s_file_name_suffix = ".json"
        this.s_file_name_prefix = "A_"
        this.s_path_name_models = "."+s_directory_separator

        this.a_o = []
        this.o_class = o_class

        var a_s_class_names_not_allowed = [
            // "Object", 
            "Array", 
            "Number", 
            "String"
        ];
        if(
            a_s_class_names_not_allowed.includes(this.o_class.name)
            ){
            console.error('the object cannot be instance of one of the following classes ' + a_s_class_names_not_allowed.join(","));

        }

        // this.O_model = o_class.constructor;
        this.s_file_name = this.s_file_name_prefix + this.o_class.name?.toLowerCase() + this.s_file_name_suffix;
        this.s_path_name_file_name = `${this.s_path_name}${s_directory_separator}${this.s_file_name}`

    }

    async f_read_file(
    ){
        
        await ensureDir(this.s_path_name)
        await ensureFile(this.s_path_name_file_name);
        // console.log(s_path_name_file_name)
        
        this.s_json = await Deno.readTextFile(this.s_path_name_file_name);
        try {
            this.a_o = JSON.parse(this.s_json);
        } catch (error) {
            console.log(error)
            // console.log(this.s_json)
            this.a_o = []
        }
        return this.a_o
    }
    async f_write_file(
    ){
        
        await ensureDir(this.s_path_name)
        await ensureFile(this.s_path_name_file_name);
        console.log(this.a_o)        
        try {
            Deno.writeTextFileSync(this.s_path_name_file_name, JSON.stringify(this.a_o))
        } catch (error) {
            console.log(error)
            return e
        }
        return this.a_o;
    }

}
class O_data_manager{
    constructor(){
        this.o_data_manager_json_file = new O_data_manager_json_file(new Object());// using Object as dummy
    }
    f_o_data_manager_json_file(o_class){

        if(o_class.name != this.o_data_manager_json_file.o_class.name){
            this.o_data_manager_json_file = new O_data_manager_json_file(o_class);
        }
        return this.o_data_manager_json_file
    }
    async f_a_o_read_file(o_class){
        this.o_data_manager_json_file = this.f_o_data_manager_json_file(o_class)
        return await this.o_data_manager_json_file.f_read_file()
        // return o_data_manager_json_file.a_o;
    }
    async f_a_o_write_file(o_class){
        this.o_data_manager_json_file = this.f_o_data_manager_json_file(o_class)
        // await this.o_data_manager_json_file.f_read_file()
        return await this.o_data_manager_json_file.f_write_file()
    }

    async f_o_create(
        o_instance,
        s_prop_name_id = 'n_id'
    ){
        var o_class = o_instance.constructor;
        var a = await this.f_a_o_read_file(o_class);
        const b_property_n_id_exists = o_instance.hasOwnProperty(s_prop_name_id);
    
        if(b_property_n_id_exists){
            
            var n_id_max = parseInt(Math.max(0,...a.map(o=>parseInt(o[s_prop_name_id]))))
            // console.log(n_id_max)
            o_instance[s_prop_name_id] = n_id_max+1        
        }
        this.o_data_manager_json_file.a_o.push(o_instance);

        this.f_a_o_write_file(o_class);
        return o_instance
    }
    async f_a_o_read(
        o_class, 
        o_filter_criterium = {}
    ){
        
        var a = await this.f_a_o_read_file(o_class);
        var a_o_filtered = a.filter(function(o){
            var b_match = true;
            for(var s_prop in o_filter_criterium){
                b_match = o_filter_criterium[s_prop] == o[s_prop]
            }
            return b_match
        })
        return a_o_filtered       
    }
    async f_a_o_update(
        o_class, 
        o_instance,
        o_instance_updated
    ){
        var a = await this.f_a_o_read_file(o_class);
        var a_o_filtered = a.filter(
            function(o){
                var b_match = true;
                for(var s_prop in o_instance){
                    console.log(s_prop)
                    b_match = o_instance[s_prop] == o[s_prop]
                }
                return b_match
            }
        )
        for(var n_index in a_o_filtered){
            var o = a_o_filtered[n_index];
            for(var s_prop in o_instance_updated){
                o[s_prop] = o_instance_updated[s_prop]
            }
        }

        return await this.f_a_o_write_file(o_class);
    }
    async f_a_o_delete(
        o_class, 
        o_filter_criterium
    ){
        var a = await this.f_a_o_read_file(o_class);
        var a_o_filtered = a.filter(
            function(o, n_index){
                var b_match = true;
                for(var s_prop in o_filter_criterium){
                    b_match = o_filter_criterium[s_prop] == o[s_prop]
                }

                return !b_match
            }
        )
        this.o_data_manager_json_file.a_o = a_o_filtered
        this.f_a_o_write_file(o_class);
        return this.o_data_manager_json_file.a_o
    }
}

export {O_data_manager}