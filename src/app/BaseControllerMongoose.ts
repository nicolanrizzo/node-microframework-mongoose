import { Container, BaseController } from 'bap-node-microframework/core';

export abstract class BaseControllerMongoose extends BaseController {
    req: any;
    res: any;

    static router: any;

    get(res: any, model: any) {
        if (typeof model !== "string") {
            res.status(200).json(model);
        }
    }

    cget(res: any, model: any) {
        Container.getModel(model).find().then(
            (data) => { res.status(200).json(data) },
            (err) => { res.status(404).json({ error: err }); }
        );
    }

    post(model: any, form: any, request: any, response: any) {
        let postModel;

        let tmp = Container.getModel(model);
        postModel = new tmp({});

        if (typeof model === "string") {
            model = postModel;
        }

        BaseControllerMongoose.processForm(model, form, request, response);
    }

    put(model: any, form: any, request: any, response: any) {
        BaseControllerMongoose.processForm(model, form, request, response);
    }

    static processForm(model: any, form: any, request: any, response: any) {
        form.handle(request, {
            success: (form) => {
                Object.keys(form.data).forEach((key) => {
                    model[key] = form.data[key];
                });

                model.save().then(
                    savedModel => {
                        if (request.method === 'PUT') {
                            return response.status(204).send();
                        }

                        return response.status(201).send(savedModel)
                    },
                    error => { response.status(500).json(error); }
                );
            },
            error: (form) => {
                response.status(400).json(form);
            },
            empty: (form) => {
                response.status(404).json(form);
            }
        });
    }

    delete(res, object) {
        object.remove().then(
            () => { res.status(204).send() },
            (err) => { res.status(500).json({ error: err }); }
        );
    }
}
